// Simplified Google Auth service for testing
interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
}

class GoogleAuthService {
  async signInWithGoogle(): Promise<GoogleAuthResponse> {
    try {
      // For now, return a test response
      return {
        access_token: 'test_access_token',
        id_token: 'test_id_token',
        user: {
          id: 'google_test_user',
          email: 'test@google.com',
          name: 'Google Test User',
          picture: 'https://via.placeholder.com/150',
        },
      };
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log('Google sign out completed');
    } catch (error) {
      console.error('Google sign out error:', error);
    }
  }
}

export default new GoogleAuthService();
