import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/shared/lib/auth';
import prisma from '@/shared/lib/database';
import { getAzureMLService } from '@/shared/lib/azure-ml';
import { apiMessages } from '@/shared/api-messages';

/**
 * Azure ML CBT API Inference Route
 * 
 * This endpoint accepts a chat message from the frontend,
 * sends it to the Azure ML CBT API endpoint, and returns the inference result.
 * 
 * Request Body:
 * {
 *   "text": "Your chat message here",       // required
 *   "session_id": "uuid",                   // optional - for conversation tracking  
 *   "persona": "empathetic"                 // optional - persona preference
 * }
 * 
 * Response:
 * {
 *   "response": "AI response text",
 *   "protocol_used": "cbt_protocol",
 *   "diagnosis": ["anxiety"],
 *   "persona_used": "empathetic",
 *   "conversationId": "uuid"                // if session tracking is used
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // ============================================
        // 1. PARSE REQUEST BODY
        // ============================================
        const body = await request.json();

        console.log('📥 Azure ML Inference request received');

        const {
            text,
            session_id,
            persona,
            conversationId,  // Support both formats
        } = body;

        // Validate text
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            console.warn('⚠️ Invalid text received');
            return NextResponse.json(
                { error: apiMessages.textRequired },
                { status: 400 }
            );
        }

        console.log('📝 Text:', text.substring(0, 100) + '...');

        // ============================================
        // 2. AUTHENTICATE USER
        // ============================================
        // Try to get token from cookie first, then Bearer header
        let token = request.cookies.get('auth_token')?.value;

        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            console.warn('⚠️ No authentication token provided');
            return NextResponse.json(
                { error: apiMessages.authorizationRequired },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = AuthService.verifyToken(token);
        if (!decoded) {
            console.warn('⚠️ Invalid authentication token');
            return NextResponse.json(
                { error: apiMessages.invalidOrExpiredToken },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            console.warn('⚠️ User not found:', decoded.userId);
            return NextResponse.json(
                { error: apiMessages.userNotFound },
                { status: 404 }
            );
        }

        console.log(JSON.stringify({ level: 'info', ctx: 'user_authenticated', userId: user.id }));

        // ============================================
        // 3. PREPARE AZURE ML CBT API REQUEST
        // ============================================
        const azureMLRequest = {
            text: text,
            user_id: user.id,
            session_id: session_id || conversationId,
            persona: persona,
        };

        console.log('🚀 Sending request to Azure ML CBT API endpoint...');

        // ============================================
        // 4. CALL AZURE ML ENDPOINT
        // ============================================
        const azureMLService = getAzureMLService();
        const startTime = Date.now();

        let azureMLResponse;
        try {
            azureMLResponse = await azureMLService.chat(azureMLRequest);
        } catch (error: any) {
            console.error('❌ Azure ML request failed:', error.message);

            // Return user-friendly error message
            return NextResponse.json(
                {
                    error: apiMessages.failedToGetAiResponse,
                    details: error.message,
                },
                { status: 503 } // Service Unavailable
            );
        }

        const duration = Date.now() - startTime;
        console.log(`✅ Azure ML response received in ${duration}ms`);

        // ============================================
        // 5. OPTIONAL: SAVE TO DATABASE
        // ============================================
        // You can save the conversation to your database here if needed
        // This is optional and depends on your application requirements

        // Example: Save to a generic chat table
        // Uncomment and modify as needed:
        /*
        if (conversationId) {
          try {
            await prisma.azureMLConversation.create({
              data: {
                userId: user.id,
                conversationId: conversationId,
                prompt: prompt,
                response: azureMLResponse.response,
                metadata: azureMLResponse.metadata || {},
                duration: duration,
              },
            });
            console.log('💾 Conversation saved to database');
          } catch (dbError) {
            console.error('⚠️ Failed to save conversation:', dbError);
            // Don't fail the request if database save fails
          }
        }
        */

        // ============================================
        // 6. RETURN RESPONSE
        // ============================================
        return NextResponse.json({
            response: azureMLResponse.response,
            protocol_used: azureMLResponse.protocol_used,
            diagnosis: azureMLResponse.diagnosis,
            persona_used: azureMLResponse.persona_used,
            tone: azureMLResponse.tone,
            protocol: azureMLResponse.protocol,
            status: azureMLResponse.status,
            conversationId: session_id || conversationId,
            duration: duration,
        }, {
            status: 200,
            headers: {
                'X-Response-Time': `${duration}ms`,
            },
        });

    } catch (error: any) {
        console.error('❌ Azure ML Inference API error:', error);

        return NextResponse.json(
            {
                error: apiMessages.internalServerError,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * Optional: GET endpoint to check API status
 */
export async function GET(request: NextRequest) {
    try {
        // Check if Azure ML CBT API is configured
        const isConfigured = !!(
            process.env.CBT_API_URL &&
            process.env.CBT_API_KEY
        );

        return NextResponse.json({
            status: 'ok',
            configured: isConfigured,
            message: isConfigured
                ? 'Azure ML CBT API endpoint is configured'
                : 'Azure ML CBT API endpoint is not configured',
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'error',
                message: error.message
            },
            { status: 500 }
        );
    }
}
