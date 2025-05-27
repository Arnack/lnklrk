
class LS {
    static setUserInfo(user: any) {
        if (typeof window !== 'undefined') {
            localStorage?.setItem('lpr64_user', JSON.stringify(user));
        }
    }

    static getUserInfo() {
        if (typeof window !== 'undefined') {
            const user = JSON.parse(localStorage?.getItem('lpr64_user') || '{}');
            return { user };
        }
        else {
            return { user: {} };
        }
    }

    static setTokens(accessToken: string, refreshToken: string) {
        if (typeof window !== 'undefined') {
            const { user } = this.getUserInfo();
            user.access_token = accessToken;
            user.refresh_token = refreshToken;
            this.setUserInfo(user);
        }
    }

    static getTokens() {
        if (typeof window !== 'undefined') {
            const { user } = this.getUserInfo();
            return {
                accessToken: user?.access_token,
                refreshToken: user?.refresh_token
            };
        }
        return {
            accessToken: null,
            refreshToken: null
        };
    }

    static removeUserInfo() {
        if (typeof window !== 'undefined') {
            localStorage?.removeItem('lpr64_user');
        }
    }
}

export default LS;