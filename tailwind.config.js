/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1rem',
  			sm: '1.5rem',
  			lg: '2rem'
  		},
  		screens: {
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1400px'
  		}
  	},
  	screens: {
  		xs: '475px',
  		sm: '640px',
  		md: '768px',
  		lg: '1024px',
  		xl: '1280px',
  		'2xl': '1536px'
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			app: {
  				bg: 'hsl(var(--app-bg))',
  				surface: 'hsl(var(--app-surface))',
  				'surface-hover': 'hsl(var(--app-surface-hover))',
  				border: 'hsl(var(--app-border))',
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			app: 'var(--app-radius)',
  			'app-lg': 'var(--app-radius-lg)',
  		},
  		boxShadow: {
  			app: 'var(--app-shadow)',
  			'app-md': 'var(--app-shadow-md)',
  			'app-lg': 'var(--app-shadow-lg)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: 0 },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: 0 }
  			},
  			'daisy-float': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' },
  			},
  			'wing-left': {
  				'0%, 100%': { transform: 'rotateY(0deg)' },
  				'50%': { transform: 'rotateY(58deg)' },
  			},
  			'wing-right': {
  				'0%, 100%': { transform: 'rotateY(0deg)' },
  				'50%': { transform: 'rotateY(-58deg)' },
  			},
  			'daisy-enter': {
  				'0%': { opacity: 0, transform: 'scale(0) translateY(40px) rotate(-20deg)' },
  				'60%': { transform: 'scale(1.15) translateY(-6px) rotate(5deg)' },
  				'100%': { opacity: 1, transform: 'scale(1) translateY(0px) rotate(0deg)' }
  			},
  			'petal-sway': {
  				'0%, 100%': { transform: 'rotate(0deg)' },
  				'50%': { transform: 'rotate(8deg)' }
  			},
  			'daisy-fly-screen': {
  				'0%':   { transform: 'translate(1rem, calc(100vh - 10rem)) rotate(-12deg)' },
  				'6%':   { transform: 'translate(18vw, 38vh) rotate(28deg)' },
  				'11%':  { transform: 'translate(62vw, 14vh) rotate(-22deg)' },
  				'18%':  { transform: 'translate(28vw, 72vh) rotate(34deg)' },
  				'24%':  { transform: 'translate(calc(100vw - 8rem), 26vh) rotate(-30deg)' },
  				'31%':  { transform: 'translate(8vw, 16vh) rotate(24deg)' },
  				'39%':  { transform: 'translate(70vw, 64vh) rotate(-18deg)' },
  				'47%':  { transform: 'translate(20vw, 8vh) rotate(32deg)' },
  				'54%':  { transform: 'translate(86vw, 44vh) rotate(-26deg)' },
  				'62%':  { transform: 'translate(38vw, 82vh) rotate(20deg)' },
  				'70%':  { transform: 'translate(10vw, 52vh) rotate(-32deg)' },
  				'78%':  { transform: 'translate(74vw, 22vh) rotate(16deg)' },
  				'86%':  { transform: 'translate(44vw, 66vh) rotate(-20deg)' },
  				'93%':  { transform: 'translate(82vw, 78vh) rotate(28deg)' },
  				'100%': { transform: 'translate(1rem, calc(100vh - 10rem)) rotate(-12deg)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'daisy-float': 'daisy-float 6s ease-in-out infinite',
  			'wing-left': 'wing-left 0.65s ease-in-out infinite',
  			'wing-right': 'wing-right 0.65s ease-in-out infinite',
  			'daisy-enter': 'daisy-enter 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  			'petal-sway': 'petal-sway 3s ease-in-out infinite',
  			'daisy-fly-screen': 'daisy-fly-screen 90s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}