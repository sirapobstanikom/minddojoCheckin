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
import { ReportsApi, AttendanceApi, LeaveApi } from '../api/client'
import { useAuth } from '../stores/auth'

export default {
  name: 'Dashboard',
  setup() {
    const todayAttendance = ref(0)
    const lateCount = ref(0)
    const leaveRequests = ref(0)
    const absentCount = ref(0)
    const auth = useAuth()
    const recentActivities = ref([])

    async function loadRecent() {
      // ล่าสุด 5 จาก attendance + leave
      const [att, leave] = await Promise.all([
        AttendanceApi.list(),
        LeaveApi.list()
      ])
      // Map ข้อมูล
      let activities = []
      for (const a of att) {
        if (a.checkInAt)
          activities.push({
            date: new Date(a.checkInAt),
            type: 'checkin',
            icon: a.lateMinutes && a.lateMinutes > 0 ? '⏰' : '✅',
            text: `เข้างานเวลา ${new Date(a.checkInAt).toLocaleTimeString('th-TH', {hour:'2-digit',minute:'2-digit'})}` + (a.lateMinutes && a.lateMinutes > 0 ? ' (มาสาย)' : '')
          })
        if (a.checkOutAt)
          activities.push({
            date: new Date(a.checkOutAt),
            type: 'checkout',
            icon: '🚪',
            text: `ออกงานเวลา ${new Date(a.checkOutAt).toLocaleTimeString('th-TH', {hour:'2-digit',minute:'2-digit'})}`
          })
      }
      for (const l of leave) {
        activities.push({
          date: new Date(l.createdAt),
          type: 'leave',
          icon: '📝',
          text:
            `ส่งคำขอลา (${leaveType(l.type)}) วันที่ ${displayRange(l.startDate, l.endDate)}`
        })
      }
      // จัดเรียงตามเวลา, เอา 5 รายการล่าสุด
      activities = activities.sort((a, b) => b.date - a.date).slice(0, 5)
      // สร้าง display time
      for (const ac of activities) {
        ac.id = ac.type + ac.date.getTime()
        ac.time = displayTimeAgo(ac.date)
      }
      recentActivities.value = activities
    }
    function leaveType(type) {
      switch (type) {
        case 'sick': return 'ลาป่วย'
        case 'personal': return 'ลากิจ'
        case 'vacation': return 'ลาพักผ่อน'
        case 'maternity': return 'ลาคลอด'
        default: return 'อื่นๆ'
      }
    }
    function displayRange(s, e) {
      const st = new Date(s).toLocaleDateString('th-TH', {day:'numeric',month:'short'})
      const en = new Date(e).toLocaleDateString('th-TH', {day:'numeric',month:'short'})
      return st===en?st:`${st}-${en}`
    }
    // Simple time-ago formatter
    function displayTimeAgo(dt) {
      const now = new Date()
      const diffMs = now - dt
      const diffMin = Math.round(diffMs / 60000)
      const diffHr = Math.round(diffMin / 60)
      const diffDay = Math.round(diffHr / 24)
      if (diffMin < 1) return 'เมื่อสักครู่'
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
      if (diffHr < 24 && dt.getDate() === now.getDate()) return `วันนี้ ${dt.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})}`
      if (diffDay < 2) return `เมื่อวาน ${dt.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})}`
      return dt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour:'2-digit',minute:'2-digit'})
    }
    onMounted(async () => {
      try {
        const s = await ReportsApi.summary()
        todayAttendance.value = s.todayAttendance || 0
        lateCount.value = s.lateCount || 0
        leaveRequests.value = s.leaveRequests || 0
        absentCount.value = s.absentCount || 0
      } catch {}
      await loadRecent()
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
