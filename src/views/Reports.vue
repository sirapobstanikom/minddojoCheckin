<template>
  <div class="reports">
    <div class="page-header">
      <h2>รายงานการเข้างาน</h2>
      <p>ดูสถิติและรายงานการเข้างานของคุณ</p>
    </div>

    <div class="report-filters">
      <div class="filter-card">
        <h3>ตัวกรองรายงาน</h3>
        
        <div class="filter-row">
          <div class="filter-group">
            <label for="reportMonth">เดือน</label>
            <select id="reportMonth" v-model="selectedMonth" @change="updateReport">
              <option value="">เลือกเดือน</option>
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="reportYear">ปี</label>
            <select id="reportYear" v-model="selectedYear" @change="updateReport">
              <option value="2024">2567</option>
              <option value="2023">2566</option>
              <option value="2022">2565</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">📅</div>
        <div class="card-content">
          <h3>{{ summaryData.totalDays }}</h3>
          <p>วันทำงานทั้งหมด</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">✅</div>
        <div class="card-content">
          <h3>{{ summaryData.presentDays }}</h3>
          <p>เข้างานปกติ</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">⏰</div>
        <div class="card-content">
          <h3>{{ summaryData.lateDays }}</h3>
          <p>มาสาย</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">❌</div>
        <div class="card-content">
          <h3>{{ summaryData.absentDays }}</h3>
          <p>ขาดงาน</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">🏖️</div>
        <div class="card-content">
          <h3>{{ summaryData.leaveDays }}</h3>
          <p>ลางาน</p>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card">
        <h3>สถิติการเข้างาน</h3>
        <div class="chart-container">
          <div class="chart-bar">
            <div class="bar-label">เข้างานปกติ</div>
            <div class="bar-container">
              <div
                class="bar-fill present"
                :style="{ width: getPercentage(summaryData.presentDays, summaryData.totalDays) + '%' }"
              ></div>
            </div>
            <div class="bar-value">{{ summaryData.presentDays }}</div>
          </div>

          <div class="chart-bar">
            <div class="bar-label">มาสาย</div>
            <div class="bar-container">
              <div
                class="bar-fill late"
                :style="{ width: getPercentage(summaryData.lateDays, summaryData.totalDays) + '%' }"
              ></div>
            </div>
            <div class="bar-value">{{ summaryData.lateDays }}</div>
          </div>

          <div class="chart-bar">
            <div class="bar-label">ขาดงาน</div>
            <div class="bar-container">
              <div
                class="bar-fill absent"
                :style="{ width: getPercentage(summaryData.absentDays, summaryData.totalDays) + '%' }"
              ></div>
            </div>
            <div class="bar-value">{{ summaryData.absentDays }}</div>
          </div>

          <div class="chart-bar">
            <div class="bar-label">ลางาน</div>
            <div class="bar-container">
              <div
                class="bar-fill leave"
                :style="{ width: getPercentage(summaryData.leaveDays, summaryData.totalDays) + '%' }"
              ></div>
            </div>
            <div class="bar-value">{{ summaryData.leaveDays }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="detailed-report">
      <h3>รายงานรายวัน</h3>
      
      <div class="report-table">
        <div class="table-header">
          <div class="col-date">วันที่</div>
          <div class="col-day">วัน</div>
          <div class="col-checkin">เวลาเข้า</div>
          <div class="col-checkout">เวลาออก</div>
          <div class="col-status">สถานะ</div>
          <div class="col-hours">ชั่วโมงทำงาน</div>
        </div>
        
        <div v-for="day in dailyReport" :key="day.date" class="table-row">
          <div class="col-date">{{ day.date }}</div>
          <div class="col-day">{{ day.day }}</div>
          <div class="col-checkin" :class="day.checkInStatus">{{ day.checkIn }}</div>
          <div class="col-checkout">{{ day.checkOut }}</div>
          <div class="col-status">
            <span class="status-badge" :class="day.status">{{ day.statusText }}</span>
          </div>
          <div class="col-hours">{{ day.workHours }}</div>
        </div>
      </div>
    </div>

    <div class="export-section">
      <button @click="exportReport" class="btn btn-primary">
        <span class="btn-icon">📊</span>
        ส่งออกรายงาน (CSV)
      </button>
      <button @click="exportXLSX" class="btn" style="margin-left:12px;background:#222;color:var(--color-yellow);">
        📁 ส่งออกรายงาน (.xlsx)
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { AttendanceApi, ReportsApi } from '../api/client'

export default {
  name: 'Reports',
  setup() {
    const selectedMonth = ref('')
    const selectedYear = ref(String(new Date().getFullYear()))
    
    const months = ref([
      { value: '01', label: 'มกราคม' },
      { value: '02', label: 'กุมภาพันธ์' },
      { value: '03', label: 'มีนาคม' },
      { value: '04', label: 'เมษายน' },
      { value: '05', label: 'พฤษภาคม' },
      { value: '06', label: 'มิถุนายน' },
      { value: '07', label: 'กรกฎาคม' },
      { value: '08', label: 'สิงหาคม' },
      { value: '09', label: 'กันยายน' },
      { value: '10', label: 'ตุลาคม' },
      { value: '11', label: 'พฤศจิกายน' },
      { value: '12', label: 'ธันวาคม' }
    ])

    const dailyReport = ref([])

    const summaryData = computed(() => {
      const totalDays = dailyReport.value.length
      const presentDays = dailyReport.value.filter(day => day.status === 'present').length
      const lateDays = dailyReport.value.filter(day => day.status === 'late').length
      const absentDays = dailyReport.value.filter(day => day.status === 'absent').length
      const leaveDays = dailyReport.value.filter(day => day.status === 'leave').length
      
      return {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        leaveDays
      }
    })

    const getPercentage = (value, total) => {
      if (total === 0) return 0
      return Math.round((value / total) * 100)
    }

    const updateReport = async () => {
      const monthKey = selectedMonth.value && selectedYear.value ? `${selectedYear.value}-${selectedMonth.value}` : ''
      await Promise.all([loadSummary(monthKey), loadDaily(monthKey)])
    }

    async function loadSummary(monthKey) {
      try {
        await ReportsApi.summary(monthKey)
        // summaryData is computed from dailyReport, so we don't need to set here
      } catch {}
    }

    async function loadDaily(monthKey) {
      try {
        const list = await AttendanceApi.list(monthKey)
        dailyReport.value = list.map(x => {
          const dateObj = new Date(x.date + 'T00:00:00')
          const dateDisp = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
          const dayDisp = dateObj.toLocaleDateString('th-TH', { weekday: 'long' })
          const checkIn = x.checkInAt ? new Date(x.checkInAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'
          const checkOut = x.checkOutAt ? new Date(x.checkOutAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'
          const isLate = (x.lateMinutes || 0) > 0
          const status = isLate ? 'late' : (x.checkInAt ? 'present' : 'absent')
          const statusText = status === 'late' ? 'มาสาย' : status === 'present' ? 'เข้างานปกติ' : 'ขาดงาน'
          let workHours = '0 ชม.'
          if (x.checkInAt && x.checkOutAt) {
            const diffMs = new Date(x.checkOutAt) - new Date(x.checkInAt)
            const hours = Math.max(0, diffMs / 3600000)
            workHours = `${hours.toFixed(1)} ชม.`
          }
          return {
            date: dateDisp,
            day: dayDisp,
            checkIn,
            checkOut,
            checkInStatus: isLate ? 'late' : 'on-time',
            status,
            statusText,
            workHours
          }
        })
      } catch {
        dailyReport.value = []
      }
    }

  const exportReport = () => {
      // สร้างข้อมูลสำหรับส่งออก
      const reportData = {
        month: selectedMonth.value,
        year: selectedYear.value,
        summary: summaryData.value,
        daily: dailyReport.value
      }
      
      // สร้างไฟล์ CSV
      const csvContent = generateCSV(reportData)
      // ตั้งชื่อไฟล์เป็นภาษาไทย และเพิ่ม BOM เพื่อให้ Excel เปิดอ่าน UTF-8 ได้ถูกต้อง
      const filename = `รายงานการเข้างาน-${selectedYear.value}-${selectedMonth.value}.csv`
      downloadCSV(csvContent, filename)
    }

    const exportXLSX = async () => {
      // สร้างข้อมูลตารางสำหรับ xlsx
      const rows = [
        ['วันที่', 'วัน', 'เวลาเข้า', 'เวลาออก', 'สถานะ', 'ชั่วโมงทำงาน']
      ]

      dailyReport.value.forEach(day => {
        rows.push([day.date, day.day, day.checkIn, day.checkOut, day.statusText, day.workHours])
      })

      // โหลดไลบรารี xlsx (แพ็กเกจถูกเพิ่มใน package.json)
      try {
        const XLSX = await import('xlsx')

        const ws = XLSX.utils.aoa_to_sheet(rows)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'รายงาน')

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

        const blob = new Blob([wbout], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const filename = `รายงานการเข้างาน-${selectedYear.value}-${selectedMonth.value}.xlsx`
        a.href = url
        a.download = filename
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('ไม่สามารถสร้างไฟล์ XLSX ได้:', err)
        alert('เกิดข้อผิดพลาดขณะสร้างไฟล์ XLSX')
      }
    }

    const generateCSV = (data) => {
      // ใส่ BOM ( FEFF) ตอนเริ่มไฟล์เพื่อให้ Excel บน Windows อ่าน UTF-8 ได้ถูกต้อง
      const BOM = '\uFEFF'
      let csv = BOM + 'วันที่,วัน,เวลาเข้า,เวลาออก,สถานะ,ชั่วโมงทำงาน\n'

      data.daily.forEach(day => {
        // escape fields ถ้าจำเป็น (ไม่ซับซ้อนในกรณีนี้ แต่เก็บไว้สำหรับความปลอดภัย)
        const row = [day.date, day.day, day.checkIn, day.checkOut, day.statusText, day.workHours]
          .map(field => {
            if (field == null) return ''
            const str = String(field)
            // ถ้ามีเครื่องหมาย "," หรือ "\n" ให้หุ้มด้วย double quotes และ escape double quotes ภายใน
            if (str.includes(',') || str.includes('\n') || str.includes('"')) {
              return '"' + str.replace(/"/g, '""') + '"'
            }
            return str
          }).join(',')

        csv += row + '\n'
      })

      return csv
    }

    const downloadCSV = (content, filename) => {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    onMounted(async () => {
      const currentMonth = new Date().getMonth() + 1
      selectedMonth.value = currentMonth.toString().padStart(2, '0')
      await updateReport()
    })

    return {
      selectedMonth,
      selectedYear,
      months,
      dailyReport,
      summaryData,
      getPercentage,
      updateReport,
      exportReport,
      exportXLSX
    }
  }
}
</script>

<style scoped>
.reports {
  max-width: 1200px;
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

.report-filters {
  margin-bottom: 2rem;
}

.filter-card {
  background: var(--color-surface-2);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
}

.filter-card h3 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.filter-row {
  display: flex;
  gap: 2rem;
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.filter-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-card {
  background: var(--color-surface-2);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 2.5rem;
}

.card-content h3 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.card-content p {
  color: #666;
  font-size: 0.9rem;
}

.charts-section {
  margin-bottom: 3rem;
}

.chart-card {
  background: var(--color-surface-2);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
}

.chart-card h3 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bar-label {
  min-width: 100px;
  font-weight: 500;
  color: #333;
}

.bar-container {
  flex: 1;
  height: 30px;
  background: #e9ecef;
  border-radius: 15px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 15px;
  transition: width 0.5s ease;
}

.bar-fill.present {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.bar-fill.late {
  background: linear-gradient(90deg, #ffc107, #fd7e14);
}

.bar-fill.absent {
  background: linear-gradient(90deg, #dc3545, #e83e8c);
}

.bar-fill.leave {
  background: linear-gradient(90deg, #6f42c1, #6610f2);
}

.bar-value {
  min-width: 40px;
  text-align: center;
  font-weight: bold;
  color: #333;
}

.detailed-report {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.detailed-report h3 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.report-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1.5fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-weight: bold;
  color: #333;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1.5fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.col-checkin.on-time {
  color: #28a745;
  font-weight: bold;
}

.col-checkin.late {
  color: #dc3545;
  font-weight: bold;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}

.status-badge.present {
  background: #d4edda;
  color: #155724;
}

.status-badge.late {
  background: #fff3cd;
  color: #856404;
}

.status-badge.absent {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.leave {
  background: #d1ecf1;
  color: #0c5460;
}

.export-section {
  text-align: center;
}

.btn {
  display: inline-flex;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.btn-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .chart-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .bar-label {
    min-width: auto;
  }
}
</style>
