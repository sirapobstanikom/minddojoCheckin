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

<style>
@import '../assets/styles/dashboard.css';
</style>
