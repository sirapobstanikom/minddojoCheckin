<template>
  <div class="dashboard">
    <div class="welcome-section">
      <h2>ยินดีต้อนรับสู่ระบบการเข้างาน</h2>
      <p>จัดการการเข้างาน ขาด ลา มาสายของคุณได้ที่นี่</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <h3>{{ todayAttendance }}</h3>
          <p>เข้างานวันนี้</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <h3>{{ lateCount }}</h3>
          <p>มาสาย</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🏖️</div>
        <div class="stat-content">
          <h3>{{ leaveRequests }}</h3>
          <p>ขอลา</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <h3>{{ absentCount }}</h3>
          <p>ขาดงาน</p>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h3>การดำเนินการด่วน</h3>
      <div class="action-buttons">
        <router-link to="/attendance" class="action-btn primary">
          <span class="btn-icon">✅</span>
          เข้างาน
        </router-link>
        <router-link to="/leave" class="action-btn secondary">
          <span class="btn-icon">📝</span>
          ขอลา
        </router-link>
        <router-link to="/reports" class="action-btn tertiary">
          <span class="btn-icon">📊</span>
          ดูรายงาน
        </router-link>
      </div>
    </div>

    <div class="recent-activity">
      <h3>กิจกรรมล่าสุด</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Dashboard',
  setup() {
    const todayAttendance = ref(0)
    const lateCount = ref(0)
    const leaveRequests = ref(0)
    const absentCount = ref(0)
    
    const recentActivities = ref([
      {
        id: 1,
        icon: '✅',
        text: 'เข้างานเวลา 08:30 น.',
        time: 'วันนี้ 08:30'
      },
      {
        id: 2,
        icon: '📝',
        text: 'ส่งคำขอลาวันที่ 15 มกราคม',
        time: 'เมื่อวาน 16:45'
      },
      {
        id: 3,
        icon: '⏰',
        text: 'มาสาย 15 นาที',
        time: '2 วันที่แล้ว 09:15'
      }
    ])

    onMounted(() => {
      // โหลดข้อมูลจาก localStorage หรือ API
      const savedData = localStorage.getItem('attendanceData')
      if (savedData) {
        const data = JSON.parse(savedData)
        todayAttendance.value = data.todayAttendance || 0
        lateCount.value = data.lateCount || 0
        leaveRequests.value = data.leaveRequests || 0
        absentCount.value = data.absentCount || 0
      }
    })

    return {
      todayAttendance,
      lateCount,
      leaveRequests,
      absentCount,
      recentActivities
    }
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--color-surface);
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(17,17,17,0.06);
}

.welcome-section h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.welcome-section p {
  color: #666;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(17,17,17,0.06);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #666;
  font-size: 0.9rem;
}

.quick-actions {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 3rem;
}

.quick-actions h3 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.action-btn.primary {
  background: #111;
  color: var(--color-yellow);
}

.action-btn.secondary {
  background: var(--color-yellow);
  color: var(--color-dark);
}

.action-btn.tertiary {
  background: transparent;
  color: #111;
  border: 1px solid rgba(17,17,17,0.06);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.btn-icon {
  font-size: 1.2rem;
}

.recent-activity {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.recent-activity h3 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.activity-icon {
  font-size: 1.5rem;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #333;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .welcome-section h2 {
    font-size: 1.5rem;
  }
}
</style>
