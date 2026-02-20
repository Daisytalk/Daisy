/**
 * Сообщения API для пользователя (русский).
 * Используются в ответах API, чтобы ошибки отображались на языке приложения.
 */
export const apiMessages = {
  // Auth — регистрация
  serverConfigurationError: 'Ошибка конфигурации сервера',
  nameEmailPasswordRequired: 'Укажите имя, email и пароль',
  nameMinLength: 'Имя должно содержать не менее 2 символов',
  invalidEmailFormat: 'Неверный формат email',
  passwordMinLength: 'Пароль должен содержать не менее 8 символов',
  userAlreadyExists: 'Пользователь с таким email уже зарегистрирован',
  internalServerError: 'Внутренняя ошибка сервера',

  // Auth — вход
  emailPasswordRequired: 'Введите email и пароль',
  invalidEmailOrPassword: 'Неверный email или пароль',
  somethingWentWrong: 'Что-то пошло не так. Попробуйте ещё раз.',

  // Auth — токен / me
  authorizationRequired: 'Требуется авторизация',
  invalidOrExpiredToken: 'Недействительный или просроченный токен',
  serviceUnavailable: 'Сервис временно недоступен',
  userNotFound: 'Пользователь не найден',
  tokenExpired: 'Срок действия токена истёк',
  invalidToken: 'Недействительный токен',

  // OAuth
  missingCode: 'Отсутствует код авторизации',
  tokenExchangeFailed: 'Не удалось обменять код на токен',
  failedToFetchUserInfo: 'Не удалось получить данные пользователя',
  oauthConfigError: 'Ошибка настройки входа через соцсети',

  // Chat / Sessions
  noMessageProvided: 'Сообщение не указано',
  unauthorized: 'Требуется авторизация',
  requestNotFound: 'Запрос не найден',
  sessionNotFound: 'Сессия не найдена',
  messageBeingProcessed: 'Ваше сообщение обрабатывается...',
  companionPreparingResponse: 'Компаньон готовит ответ...',

  // CBT
  messageRequired: 'Введите сообщение',
  conversationNotFound: 'Диалог не найден',
  failedToProcessMessage: 'Не удалось обработать сообщение',
  failedToRetrieveConversations: 'Не удалось загрузить диалоги',
  failedToSetTone: 'Не удалось сохранить настройку',
  failedToGetPersonas: 'Не удалось загрузить персонажей',

  // Onboarding
  unauthorizedToAccessData: 'Нет доступа к этим данным',
  onboardingDataNotFound: 'Данные онбординга не найдены',
  answersArrayRequired: 'Необходимо передать ответы',
  atLeastOneAnswerRequired: 'Нужен хотя бы один ответ',
  onboardingCompletedSuccess: 'Онбординг успешно завершён',
  onboardingDataReceivedSuccess: 'Данные получены',

  // Payments
  paymentIdRequired: 'Укажите идентификатор платежа',
  paymentCreationFailed: 'Не удалось создать платёж',
  statusCheckFailed: 'Не удалось проверить статус',

  // Azure ML
  textRequired: 'Текст сообщения обязателен',
  failedToGetAiResponse: 'Не удалось получить ответ от модели',

  // Subscription
  trialExpired: 'Пробный период истёк. Выберите план для продолжения.',

  // Newsletter
  emailRequired: 'Укажите email',
  invalidEmail: 'Неверный формат email',
  alreadySubscribed: 'Этот email уже подписан',
  subscriptionFailed: 'Не удалось оформить подписку',
  newsletterSubscribedSuccess: 'Вы успешно подписались на рассылку',
} as const

export type ApiMessageKey = keyof typeof apiMessages
