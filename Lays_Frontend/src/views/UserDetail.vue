<template>
  <div class="user-detail-page">
    <h2>My Account</h2>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="user" class="account-sections">
      <!-- Current Info -->
      <div class="info-section">
        <h3>Account Information</h3>
        <div class="info-item">
          <strong>Name:</strong> {{ user.firstName }} {{ user.lastName }}
        </div>
        <div class="info-item">
          <strong>Email:</strong> {{ user.email }}
        </div>
        <div class="info-item">
          <strong>Role:</strong> {{ user.role }}
        </div>
        <div class="info-item">
          <strong>Status:</strong> {{ user.banned ? 'Banned' : 'Active' }}
        </div>
      </div>
      
      <!-- Update Credentials -->
      <div class="update-section">
        <h3>Update Credentials</h3>
        <form @submit.prevent="updateCredentials" class="update-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input 
              id="firstName" 
              v-model="updateData.firstName" 
              type="text" 
              placeholder="Enter new first name"
            />
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input 
              id="lastName" 
              v-model="updateData.lastName" 
              type="text" 
              placeholder="Enter new last name"
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email" 
              v-model="updateData.email" 
              type="email" 
              placeholder="Enter new email"
            />
          </div>
          <div class="form-group">
            <label for="password">New Password</label>
            <input 
              id="password" 
              v-model="updateData.password" 
              type="password" 
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input 
              id="confirmPassword" 
              v-model="updateData.confirmPassword" 
              type="password" 
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" :disabled="updating" class="update-btn">
            {{ updating ? 'Updating...' : 'Update Credentials' }}
          </button>
          <div v-if="updateMessage" :class="{ 'success': updateMessage.includes('success'), 'error': updateMessage.includes('Failed') }" class="update-message">
            {{ updateMessage }}
          </div>
        </form>
      </div>
      
      <!-- Delete Account -->
      <div class="delete-section">
        <h3>Danger Zone</h3>
        <p class="warning">Once you delete your account, there is no going back. Please be certain.</p>
        <button @click="confirmDelete" class="delete-btn">Delete My Account</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  name: 'UserDetail',
  data() {
    return {
      user: null,
      loading: false,
      error: null,
      updateData: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      updating: false,
      updateMessage: ''
    };
  },
  async created() {
    await this.loadUser();
  },
  methods: {
    async loadUser() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.get('/user/me');
        this.user = res.data;
      } catch (err) {
        this.error = 'Could not load user information';
      }
      this.loading = false;
    },
    async updateCredentials() {
      if (this.updateData.password && this.updateData.password !== this.updateData.confirmPassword) {
        this.updateMessage = 'Passwords do not match';
        return;
      }
      
      this.updating = true;
      this.updateMessage = '';
      
      try {
        const updatePayload = {};
        if (this.updateData.firstName) updatePayload.firstName = this.updateData.firstName;
        if (this.updateData.lastName) updatePayload.lastName = this.updateData.lastName;
        if (this.updateData.email) updatePayload.email = this.updateData.email;
        if (this.updateData.password) updatePayload.password = this.updateData.password;
        
        if (Object.keys(updatePayload).length === 0) {
          this.updateMessage = 'No changes to update';
          return;
        }
        
        await api.put('/user/me', updatePayload);
        this.updateMessage = 'Credentials updated successfully!';
        
        // Clear form
        this.updateData = {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        };
        
        // Reload user info
        await this.loadUser();
        
        setTimeout(() => { this.updateMessage = ''; }, 3000);
      } catch (err) {
        this.updateMessage = err.response?.data?.message || 'Failed to update credentials';
      }
      this.updating = false;
    },
    confirmDelete() {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        this.deleteAccount();
      }
    },
    async deleteAccount() {
      try {
        await api.delete('/user/me');
        // Clear token and redirect to login
        localStorage.removeItem('token');
        this.$router.push('/login');
      } catch (err) {
        alert('Failed to delete account: ' + (err.response?.data?.message || 'Unknown error'));
      }
    }
  }
};
</script>

<style scoped>
.user-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e5e7eb;
  padding: 20px;
}

.user-detail-page h2 {
  color: #fbbf24;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  text-align: center;
}

.account-sections {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-section, .update-section, .delete-section {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
}

.info-section h3, .update-section h3, .delete-section h3 {
  color: #fbbf24;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(251,191,36,0.3);
  padding-bottom: 8px;
}

.info-item {
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.update-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #e5e7eb;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  background-color: rgba(30,41,59,0.8);
  color: #e5e7eb;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-group input:focus {
  outline: none;
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.2);
  background-color: rgba(30,41,59,0.9);
}

.form-group input::placeholder {
  color: #9ca3af;
}

.update-btn {
  padding: 14px;
  background: linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%);
  color: #0f172a;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(251,191,36,0.3);
}

.update-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(251,191,36,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(251,191,36,0.4);
}

.update-btn:disabled {
  background: rgba(75,85,99,0.6);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.update-message {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

.update-message.success {
  background: rgba(34,197,94,0.15);
  color: #bbf7d0;
  border: 1px solid rgba(34,197,94,0.3);
}

.update-message.error {
  background: rgba(239,68,68,0.15);
  color: #fecaca;
  border: 1px solid rgba(239,68,68,0.3);
}

.delete-section {
  border: 2px solid rgba(239,68,68,0.3);
}

.delete-section .warning {
  color: #fecaca;
  font-style: italic;
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(239,68,68,0.1);
  border-radius: 8px;
  border-left: 4px solid #ef4444;
}

.delete-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(220,38,38,0.9) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(239,68,68,0.3);
}

.delete-btn:hover {
  background: linear-gradient(135deg, rgba(220,38,38,0.9) 0%, rgba(239,68,68,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(239,68,68,0.4);
}

.loading, .error {
  text-align: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  margin: 20px 0;
}

.loading {
  color: #e5e7eb;
}

.error {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fecaca;
}

@media (max-width: 768px) {
  .user-detail-page {
    padding: 10px;
  }

  .account-sections {
    gap: 20px;
  }

  .info-section, .update-section, .delete-section {
    padding: 16px;
  }

  .update-form {
    gap: 12px;
  }
}
</style>
