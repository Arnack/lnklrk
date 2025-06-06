export const translations = {
  en: {
    welcome: "Welcome back",
    enterCredentials: "Enter your credentials to sign in to your account",
    email: "Email",
    password: "Password",
    signingIn: "Signing in",
    signIn: "Sign in",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign up",
    showPassword: "Show password",
    hidePassword: "Hide password",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    chinnyCRM: "Chinny CRM",
    byLinkLark: "by Link Lark",
    streamline: "Created with ⌨️ and ❤️ by Greg",
    invalidCredentials: "Invalid email or password",
    loading: "Loading...",
    login: "Login",
    loginPlaceholder: "login",
  },
  zh: {
    welcome: "欢迎回来",
    enterCredentials: "请输入您的凭据以登录您的帐户",
    email: "电子邮件",
    password: "密码",
    signingIn: "登录中...",
    signIn: "登录",
    dontHaveAccount: "没有帐户？",
    signUp: "注册",
    showPassword: "显示密码",
    hidePassword: "隐藏密码",
    language: "语言",
    theme: "主题",
    light: "亮",
    dark: "暗",
    system: "系统",
    chinnyCRM: "Chinny CRM",
    byLinkLark: "by Link Lark",
    streamline: "欧利以键盘为笔，以爱心为墨，倾心创作",
    invalidCredentials: "无效的电子邮件或密码",
    loading: "加载中...",
    login: "登录",
    loginPlaceholder: "登录",
  }
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
