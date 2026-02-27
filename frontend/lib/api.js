/**
 * API client wrapper for SkillSwap backend
 * Automatically attaches JWT token from localStorage
 * Reads API URL from NEXT_PUBLIC_API_URL environment variable
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Get auth token from localStorage
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Set auth token in localStorage
   */
  setToken(token) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  /**
   * Remove auth token from localStorage
   */
  clearToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }

  /**
   * Make authenticated request
   */
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(name, email, password, lat, lng) {
    const data = await this.request('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, lat, lng }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  logout() {
    this.clearToken();
  }

  // User endpoints
  async getMe() {
    return this.request('/api/me');
  }

  async updateMe(updates) {
    return this.request('/api/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getNearbyUsers(lat, lng, radiusKm = 5, search = '') {
    const params = new URLSearchParams({ lat, lng, radiusKm, search });
    return this.request(`/api/users/nearby?${params}`);
  }

  // Trade endpoints
  async createTrade(providerId, requesterId, skill, hours = 1) {
    return this.request('/api/trades', {
      method: 'POST',
      body: JSON.stringify({ providerId, requesterId, skill, hours }),
    });
  }

  async getTrades() {
    return this.request('/api/trades');
  }

  async completeTrade(tradeId) {
    return this.request(`/api/trades/${tradeId}/complete`, {
      method: 'POST',
    });
  }

  async cancelTrade(tradeId) {
    return this.request(`/api/trades/${tradeId}`, {
      method: 'DELETE',
    });
  }

  // Ledger endpoints
  async getLedger(userId = null, limit = 50, offset = 0) {
    if (userId) {
      return this.request(`/api/ledger/${userId}?limit=${limit}&offset=${offset}`);
    } else {
      return this.request(`/api/ledger?limit=${limit}&offset=${offset}`);
    }
  }

  // Transfer credits
  async transferCredits(recipientId, amount, message = '') {
    return this.request('/api/ledger/transfer', {
      method: 'POST',
      body: JSON.stringify({ recipientId, amount, message }),
    });
  }

  // Stats endpoints
  async getWeeklyHelps() {
    return this.request('/api/stats/weekly-helps');
  }

  // Skill verification endpoints
  async verifySkill(skillId, yearsOfExp) {
    return this.request(`/api/skills/${skillId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ yearsOfExp }),
    });
  }

  async updateSkillLevel(skillId, level, yearsOfExp) {
    return this.request(`/api/skills/${skillId}/level`, {
      method: 'PUT',
      body: JSON.stringify({ level, yearsOfExp }),
    });
  }

  // Message endpoints
  async getConversations() {
    return this.request('/api/messages/conversations');
  }

  async getMessages(userId) {
    return this.request(`/api/messages/${userId}`);
  }

  async sendMessage(receiverId, content, tradeId = null) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, tradeId }),
    });
  }

  async getUnreadCount() {
    return this.request('/api/messages/unread/count');
  }

  async markMessageRead(messageId) {
    return this.request(`/api/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // ============ Reviews ============

  async submitReview(tradeId, revieweeId, rating, comment = null) {
    return this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ tradeId, revieweeId, rating, comment }),
    });
  }

  async getUserReviews(userId) {
    return this.request(`/api/reviews/${userId}`);
  }

  async checkTradeReview(tradeId) {
    return this.request(`/api/reviews/trade/${tradeId}/check`);
  }

  async getpendingReviews() {
    return this.request('/api/reviews/pending');
  }

  // ============ Skill Verification ============

  async requestSkillVerification(skillId, proofData = {}) {
    const { proofUrl, proofType, proofDescription } = proofData;
    return this.request('/api/skills/verify-request', {
      method: 'POST',
      body: JSON.stringify({ 
        skillId, 
        verificationType: 'peer', 
        proofUrl: proofUrl || null,
        proofType: proofType || null,
        proofDescription: proofDescription || null
      }),
    });
  }

  async verifySkill(skillId, verificationNote = '') {
    return this.request(`/api/skills/${skillId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verificationNote }),
    });
  }

  async getVerificationEligibleSkills() {
    return this.request('/api/skills/verification-eligible');
  }

  // ============ AI Proofreading ============

  async proofreadText(text, context = 'general') {
    return this.request('/api/ai/proofread', {
      method: 'POST',
      body: JSON.stringify({ text, context }),
    });
  }

  async getAIUsage() {
    return this.request('/api/ai/usage');
  }
}

const api = new ApiClient();

export default api;
