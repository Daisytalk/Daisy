export interface ResearchPaper {
  id: string
  slug: string
  title: string
  /** Заголовок на русском для локали ru */
  titleRu: string
  authors: string
  year: number
  abstract: string
  /** Абстракт на русском для локали ru */
  abstractRu: string
  link: string
  imageUrl: string
  date: string
  readTime: string
}

export const researchPapers: ResearchPaper[] = [
  {
    id: '1',
    slug: 'ai-psychotherapy-review',
    title: 'Artificial Intelligence for Psychotherapy: A Review of the Current State and Future Directions',
    titleRu: 'Искусственный интеллект в психотерапии: обзор современного состояния и перспективы развития',
    authors: 'Beg, M. J., Verma, M., & Verma, M. K.',
    year: 2024,
    date: 'June, 2024',
    readTime: '12 min read',
    abstract: `Despite its effectiveness, psychotherapy faces barriers of access and stigma. Artificial intelligence (AI) offers new opportunities to improve mental health care by enhancing availability and personalizing interventions. This narrative review, covering 28 studies from 2009 to 2023, investigated the role of AI in psychotherapy for depression and anxiety disorders.

Results indicate that AI-supported interventions, especially chatbots and cognitive-behavioral therapy delivered online, provide moderate to strong improvements in symptoms. They also increase patient motivation and engagement. However, unresolved challenges include risks to data privacy, reduced therapeutic trust, and limited emotional reciprocity.

The review concludes that AI can complement human therapists and extend the reach of psychotherapy in cost-effective ways. Ethical frameworks, transparency, and clinical oversight are essential to ensure responsible integration. Future research should continue to explore the balance between technological efficiency and the therapeutic relationship at the heart of mental health care.`,
    abstractRu: `Несмотря на эффективность, психотерапия сталкивается с барьерами доступа и стигмой. Искусственный интеллект (ИИ) открывает новые возможности для улучшения психиатрической помощи за счёт доступности и персонализации вмешательств. В этом обзоре 28 исследований (2009–2023) рассматривается роль ИИ в психотерапии депрессии и тревожных расстройств.

Результаты показывают, что интервенции с поддержкой ИИ, особенно чат-боты и когнитивно-поведенческая терапия онлайн, дают умеренное и выраженное улучшение симптомов и повышают мотивацию пациентов. Остаются нерешённые вопросы: риски для конфиденциальности, снижение доверия к терапии и ограниченная эмоциональная взаимность.

Авторы делают вывод, что ИИ может дополнять специалистов и расширять охват психотерапии при соблюдении этических норм, прозрачности и клинического контроля.`,
    link: 'https://journals.sagepub.com/doi/full/10.1177/02537176241260819',
    imageUrl: '/images/Artificial intelligence and psychotherapy.JPG'
  },
  {
    id: '2',
    slug: 'digital-mental-health-ai-role',
    title: 'Digital Mental Health: Role of Artificial Intelligence in Psychotherapy',
    titleRu: 'Цифровое психическое здоровье: роль искусственного интеллекта в психотерапии',
    authors: 'Bhatt, S.',
    year: 2024,
    date: 'March, 2024',
    readTime: '10 min read',
    abstract: `Global shortages of mental health professionals, combined with the surge in psychological distress after the COVID-19 pandemic, underscore the need for scalable solutions. Artificial intelligence (AI) is increasingly applied in psychotherapy through chatbots and online counselling tools.

This systematic review screened 95 studies and included 13 based on eligibility criteria. Most interventions used conversational agents. Evidence suggests AI-based tools provide significant benefits in reducing symptoms of common mental health disorders, particularly depression and anxiety. They also enhance accessibility by lowering costs and reducing stigma associated with care.

Findings support the integration of AI into traditional psychotherapy to expand mental health service delivery. However, successful adoption requires addressing challenges of personalization, data privacy, and therapeutic trust. AI is best positioned as a complementary approach, supporting but not replacing human clinicians in mental health care.`,
    abstractRu: `Глобальная нехватка специалистов по психическому здоровью и рост дистресса после пандемии COVID-19 усиливают потребность в масштабируемых решениях. ИИ всё чаще применяется в психотерапии через чат-ботов и инструменты онлайн-консультирования.

В систематический обзор вошли 13 из 95 отобранных исследований; в большинстве использовались диалоговые агенты. Данные свидетельствуют, что инструменты на основе ИИ существенно снижают симптомы депрессии и тревоги и повышают доступность помощи, снижая затраты и стигму.

Интеграция ИИ в традиционную психотерапию может расширить охват услуг; для успешного внедрения важно решать вопросы персонализации, конфиденциальности и доверия. ИИ рассматривается как дополнение к специалистам, а не их замена.`,
    link: 'https://journals.sagepub.com/doi/full/10.1177/09727531231221612',
    imageUrl: '/images/digital mental health.JPG'
  },
  {
    id: '3',
    slug: 'can-ai-replace-psychotherapists',
    title: 'Can AI Replace Psychotherapists? Exploring the Future of Mental Health Care',
    titleRu: 'Может ли ИИ заменить психотерапевтов? Будущее психиатрической помощи',
    authors: 'Zhang, Z., & Wang, J.',
    year: 2024,
    date: 'October, 2024',
    readTime: '15 min read',
    abstract: `Artificial intelligence (AI) has entered mental health care at a time of global crisis marked by high demand and limited professional resources. This review considers whether AI can replace psychotherapists, examining applications in emotion recognition, therapeutic chatbots, and predictive analytics.

Advancements in machine learning and natural language processing enable systems such as ChatGPT to simulate emotionally relevant interactions and deliver structured interventions like cognitive-behavioral therapy. Early studies indicate that AI can support symptom reduction and engagement in patients with depression and anxiety, with potential to scale interventions widely.

Nonetheless, AI's role remains limited by its lack of genuine emotional understanding, small-scale evidence bases, and ethical concerns related to privacy, bias, and clinical responsibility.

The review concludes that AI cannot replace psychotherapists but can significantly extend the reach of mental health care. The future of psychotherapy lies in a hybrid model, where AI augments human expertise, reduces barriers to access, and ensures that care remains both effective and humane.`,
    abstractRu: `ИИ пришёл в сферу психического здоровья в период глобального кризиса: высокий спрос и нехватка специалистов. В обзоре рассматривается вопрос, может ли ИИ заменить психотерапевтов; анализируются приложения для распознавания эмоций, терапевтические чат-боты и предиктивная аналитика.

Развитие машинного обучения и обработки естественного языка позволяет системам вроде ChatGPT имитировать эмоционально значимые диалоги и проводить структурированные интервенции (например, КПТ). Ранние исследования показывают, что ИИ может способствовать снижению симптомов и вовлечённости при депрессии и тревоге.

Однако ИИ ограничен отсутствием подлинного эмоционального понимания, узкой доказательной базой и этическими рисками (конфиденциальность, предвзятость, ответственность). Вывод: ИИ не заменит психотерапевтов, но может существенно расширить доступ к помощи; будущее - в гибридной модели, где ИИ дополняет экспертизу человека.`,
    link: 'https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2024.1444382/full?trk=public_post_comment-text',
    imageUrl: '/images/Can Ai replace psychotherapists.JPG'
  },
  {
    id: '4',
    slug: 'ai-psychotherapy-counterpoint',
    title: 'Artificial Intelligence and Psychotherapy: A Counterpoint',
    titleRu: 'Искусственный интеллект и психотерапия: контраргументы',
    authors: 'Richards, D.',
    year: 2024,
    date: 'May, 2024',
    readTime: '11 min read',
    abstract: `Psychotherapy is most effective when it combines evidence-based techniques with human guidance. Digital delivery formats have expanded access while maintaining treatment quality. Integrating artificial intelligence (AI) has the potential to further enhance psychotherapy by improving early detection, predicting treatment outcomes, supporting adherence, and reducing relapse.

Research shows that AI can strengthen the impact of therapy by leveraging data from digital interventions, helping therapists personalize care and optimize treatment strategies. While caution is needed to avoid overreliance on algorithms, the evidence suggests that AI-supported psychotherapy can improve clinical outcomes and make effective mental health care more widely accessible.`,
    abstractRu: `Психотерапия наиболее эффективна при сочетании доказательных методов и руководства специалиста. Цифровые форматы уже расширили доступ при сохранении качества. Интеграция ИИ может усилить психотерапию: раннее выявление, прогноз исходов, поддержка приверженности и снижение рецидивов.

Исследования показывают, что ИИ способен усиливать эффект терапии за счёт данных цифровых интервенций, помогая персонализировать помощь и оптимизировать стратегии. При осторожном отношении к алгоритмам ИИ-поддержка может улучшать исходы и делать эффективную помощь более доступной.`,
    link: 'https://onlinelibrary.wiley.com/doi/full/10.1002/capr.12758',
    imageUrl: '/images/Artificial intelligence and psychotherapy.JPG'
  },
  {
    id: '5',
    slug: 'ai-psychotherapeutic-intervention-outcomes',
    title: 'Artificial Intelligence-Based Psychotherapeutic Intervention on Psychological Outcome',
    titleRu: 'Психотерапевтические интервенции на основе ИИ и психологические исходы',
    authors: 'Lau, Y., Ang, W. H. D., Ang, W. W., Pang, P. C.-I., Wong, S. H., & Chan, K. S.',
    year: 2025,
    date: 'January, 2025',
    readTime: '14 min read',
    abstract: `Artificial intelligence (AI) based psychotherapeutic interventions are emerging as a promising approach to support mental health care. This study evaluated their effectiveness in reducing depressive, anxiety, and stress symptoms across 30 randomized controlled trials with over 6,100 participants from nine countries.

Results showed that AI interventions significantly reduced depressive symptoms immediately after treatment, with a medium effect size, and maintained smaller but meaningful improvements at 6-12 months. Participants with depression benefited the most, while effects on anxiety and stress were less pronounced.

These findings indicate that AI-based psychotherapy can effectively complement traditional care for depression, providing an accessible tool to improve mental health outcomes. Continued research with long-term follow-up is needed to confirm these effects and explore strategies to enhance impact on anxiety and stress.`,
    abstractRu: `Психотерапевтические интервенции на основе ИИ становятся перспективным направлением поддержки психического здоровья. В исследовании оценивалась их эффективность в снижении депрессивных, тревожных и стрессовых симптомов в 30 РКИ с более чем 6100 участниками из девяти стран.

Результаты: интервенции с ИИ достоверно снижали депрессивные симптомы сразу после лечения (средний размер эффекта) и сохраняли меньший, но значимый эффект через 6–12 месяцев. Наибольшая польза - у участников с депрессией; влияние на тревогу и стресс менее выражено.

Вывод: ИИ-психотерапия может эффективно дополнять традиционную помощь при депрессии. Необходимы долгосрочные исследования и стратегии усиления эффекта при тревоге и стрессе.`,
    link: 'https://onlinelibrary.wiley.com/doi/full/10.1155/da/8930012',
    imageUrl: '/images/artificial intelligence based psychographic intervention.JPG'
  },
  {
    id: '6',
    slug: 'ai-chatbots-psychiatry',
    title: 'Artificial Intelligence and Chatbots in Psychiatry',
    titleRu: 'Искусственный интеллект и чат-боты в психиатрии',
    authors: 'Pham, K. T., Nabizadeh, A., & Selek, S.',
    year: 2022,
    date: 'February, 2022',
    readTime: '9 min read',
    abstract: `The demand for mental health care continues to rise, and shortages of providers-exacerbated by the COVID-19 pandemic have increased the need for innovative solutions. Artificial intelligence (AI) is emerging as a tool to support psychiatry by assisting with diagnosis, symptom monitoring, disease prediction, and patient education.

AI-based interventions include conversational chatbots that teach emotional coping skills, avatar therapy using computer-generated faces, and intelligent animal-like robots that provide interactive support. These technologies can help individuals with communication difficulties and expand access to mental health support through the internet, smartphone apps, and digital platforms.

Incorporating AI into psychiatric care offers the potential to complement human clinicians, enhance treatment accessibility, and provide personalized support. At the same time, careful consideration of ethical, privacy, and clinical implications is essential. These AI-driven tools represent a growing frontier in mental health care, with the potential to transform how support is delivered and experienced.`,
    abstractRu: `Спрос на психиатрическую помощь растёт, а нехватка специалистов, усугублённая пандемией COVID-19, повышает потребность в инновациях. ИИ используется для поддержки психиатрии: помощь в диагностике, мониторинг симптомов, прогноз течения и просвещение пациентов.

Интервенции на основе ИИ включают чат-ботов с навыками совладания с эмоциями, аватар-терапию и интерактивных роботов. Эти технологии помогают людям с трудностями в общении и расширяют доступ к поддержке через интернет и приложения.

Внедрение ИИ в психиатрическую помощь может дополнять специалистов, повышать доступность и персонализацию. Необходим учёт этических, конфиденциальных и клинических аспектов.`,
    link: 'https://pubmed.ncbi.nlm.nih.gov/35212940/',
    imageUrl: '/images/Artificial_intelligence and chatbots.JPG'
  }
]

export function getResearchPaperBySlug(slug: string): ResearchPaper | undefined {
  return researchPapers.find(paper => paper.slug === slug)
}

export function getAllResearchPapers(): ResearchPaper[] {
  return researchPapers
}
