<template>
  <div class="attendance">
    <div class="page-header">
      <h2>ระบบเข้างาน</h2>
      <p>บันทึกการเข้างานและออกงานของคุณ</p>
    </div>

    <div class="attendance-form">
      <div class="form-card">
        <h3>บันทึกการเข้างาน</h3>
        
        <div class="current-time">
          <div class="time-display">
            <span class="time">{{ currentTime }}</span>
            <span class="date">{{ currentDate }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button 
            @click="checkIn" 
            :disabled="isCheckedIn"
            class="btn btn-primary"
          >
            <span class="btn-icon">✅</span>
            เข้างาน
          </button>
          
          <button 
            @click="checkOut" 
            :disabled="!isCheckedIn"
            class="btn btn-secondary"
          >
            <span class="btn-icon">🚪</span>
            ออกงาน
          </button>
        </div>

        <div v-if="attendanceStatus" class="status-message" :class="attendanceStatus.type">
          <span class="status-icon">{{ attendanceStatus.icon }}</span>
          <span>{{ attendanceStatus.message }}</span>
        </div>
      </div>
    </div>

    <div class="attendance-history">
      <h3>ประวัติการเข้างาน</h3>
      
      <div class="filter-section">
        <select v-model="selectedMonth" @change="filterAttendance">
          <option value="">เลือกเดือน</option>
          <option v-for="month in months" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
      </div>

      <div class="history-list">
        <div v-for="record in filteredAttendance" :key="record.id" class="history-item">
          <div class="date-info">
            <div class="day">{{ record.day }}</div>
            <div class="date">{{ record.date }}</div>
          </div>
          
          <div class="time-info">
            <div class="check-in">
              <span class="label">เข้า:</span>
              <span class="time" :class="record.checkInStatus">{{ record.checkIn }}</span>
            </div>
            <div class="check-out">
              <span class="label">ออก:</span>
              <span class="time">{{ record.checkOut || '-' }}</span>
            </div>
          </div>
          
          <div class="status-badge" :class="record.status">
            {{ record.statusText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { AttendanceApi } from '../api/client'

export default {
  name: 'Attendance',
  setup() {
    const currentTime = ref('')
    const currentDate = ref('')
    const isCheckedIn = ref(false)
    const attendanceStatus = ref(null)
    const selectedMonth = ref('')
    
    const attendanceRecords = ref([])

    const months = ref([
      { value: '2024-01', label: 'มกราคม 2567' },
      { value: '2024-02', label: 'กุมภาพันธ์ 2567' },
      { value: '2024-03', label: 'มีนาคม 2567' }
    ])

    const filteredAttendance = computed(() => {
      if (!selectedMonth.value) {
        return attendanceRecords.value
      }
      return attendanceRecords.value.filter(record => 
        record.date.includes(selectedMonth.value.split('-')[1])
      )
    })

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      currentDate.value = now.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }

    const checkIn = async () => {
      try {
        const doc = await AttendanceApi.checkIn()
        isCheckedIn.value = true
        const ci = new Date(doc.checkInAt)
        const checkInTime = ci.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        const isLate = (doc.lateMinutes || 0) > 0
        attendanceStatus.value = isLate
          ? { type: 'warning', icon: '⚠️', message: `เข้างานเวลา ${checkInTime} (มาสาย)` }
          : { type: 'success', icon: '✅', message: `เข้างานเวลา ${checkInTime} (ตรงเวลา)` }
        await loadList()
      } catch (e) {
        attendanceStatus.value = { type: 'warning', icon: '⚠️', message: e?.message || 'ไม่สามารถเข้างานได้' }
      }
    }

    const checkOut = async () => {
      try {
        const doc = await AttendanceApi.checkOut()
        isCheckedIn.value = false
        const co = new Date(doc.checkOutAt)
        const checkOutTime = co.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        attendanceStatus.value = { type: 'info', icon: '🚪', message: `ออกงานเวลา ${checkOutTime}` }
        await loadList()
      } catch (e) {
        attendanceStatus.value = { type: 'warning', icon: '⚠️', message: e?.message || 'ไม่สามารถออกงานได้' }
      }
    }

    const filterAttendance = () => {
      // การกรองจะทำงานผ่าน computed property
    }

    async function loadList(month) {
      const list = await AttendanceApi.list(month)
      attendanceRecords.value = list.map(x => {
        const dateObj = new Date(x.date + 'T00:00:00')
        const day = dateObj.toLocaleDateString('th-TH', { weekday: 'short' })
        const dateDisp = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
        const checkIn = x.checkInAt ? new Date(x.checkInAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'
        const checkOut = x.checkOutAt ? new Date(x.checkOutAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : null
        const isLate = (x.lateMinutes || 0) > 0
        return {
          id: x._id,
          day,
          date: dateDisp,
          checkIn,
          checkOut,
          checkInStatus: isLate ? 'late' : 'on-time',
          status: isLate ? 'late' : 'present',
          statusText: isLate ? 'มาสาย' : 'เข้างานปกติ'
        }
      })
    }

    onMounted(async () => {
      updateTime()
      setInterval(updateTime, 1000)
      try {
        const today = await AttendanceApi.today()
        isCheckedIn.value = !!(today && today.checkInAt && !today.checkOutAt)
      } catch {}
      await loadList()
    })

    return {
      currentTime,
      currentDate,
      isCheckedIn,
      attendanceStatus,
      selectedMonth,
      attendanceRecords,
      months,
      filteredAttendance,
      checkIn,
      checkOut,
      filterAttendance
    }
  }
}
</script>

<style scoped>
.attendance {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.attendance-form {
  margin-bottom: 3rem;
}

.form-card {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(17,17,17,0.06);
  text-align: center;
}

.form-card h3 {
  color: var(--color-dark);
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.current-time {
  margin-bottom: 2rem;
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.time {
  font-size: 3rem;
  font-weight: bold;
  color: #111;
  font-family: 'Courier New', monospace;
}

.date {
  font-size: 1.2rem;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-yellow);
  color: var(--color-dark);
}

.btn-secondary {
  background: var(--color-dark);
  color: var(--color-yellow);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  font-size: 1.2rem;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 500;
}

.status-message.success {
  background: rgba(0,0,0,0.06);
  color: #111;
  border: 1px solid rgba(17,17,17,0.06);
}

  status-message.warning {
  background: var(--color-yellow-200);
  color: #665500;
  border: 1px solid rgba(254,210,1,0.24);
}

.status-message.info {
  background: rgba(17,17,17,0.04);
  color: #111;
  border: 1px solid rgba(17,17,17,0.04);
}

.status-icon {
  font-size: 1.2rem;
}

.attendance-history {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.attendance-history h3 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.filter-section select:focus {
  outline: none;
  border-color: #667eea;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--color-surface);
  border-radius: 10px;
  border-left: 6px solid var(--color-yellow-300);
}

.history-item:nth-child(odd) {
  background: #ffffff;
}

.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.day {
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
}

.date {
  color: #666;
  font-size: 0.8rem;
}

.time-info {
  flex: 1;
  display: flex;
  gap: 2rem;
}

.check-in, .check-out {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.time {
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.time.on-time {
  color: #111;
}

.time.late {
  color: #665500;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  min-width: 100px;
}

.status-badge.present {
  background: rgba(0,0,0,0.06);
  color: #111;
}

.status-badge.late {
  background: var(--color-yellow-200);
  color: #665500;
}

.status-badge.absent {
  background: rgba(17,17,17,0.04);
  color: #111;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .time {
    font-size: 2rem;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .time-info {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
