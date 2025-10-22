<template>
  <div class="leave-request">
    <div class="page-header">
      <h2>ระบบขอลา</h2>
      <p>ส่งคำขอลาและติดตามสถานะการอนุมัติ</p>
    </div>

    <div class="leave-form">
      <div class="form-card">
        <h3>ส่งคำขอลา</h3>
        
        <form @submit.prevent="submitLeaveRequest">
          <div class="form-group">
            <label for="leaveType">ประเภทการลา</label>
            <select id="leaveType" v-model="leaveForm.type" required>
              <option value="">เลือกประเภทการลา</option>
              <option value="sick">ลาป่วย</option>
              <option value="personal">ลากิจส่วนตัว</option>
              <option value="vacation">ลาพักผ่อน</option>
              <option value="maternity">ลาคลอด</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          <div class="form-group">
            <label for="startDate">วันที่เริ่มลา</label>
            <input 
              id="startDate" 
              type="date" 
              v-model="leaveForm.startDate" 
              required
            >
          </div>

          <div class="form-group">
            <label for="endDate">วันที่สิ้นสุดลา</label>
            <input 
              id="endDate" 
              type="date" 
              v-model="leaveForm.endDate" 
              required
            >
          </div>

          <div class="form-group">
            <label for="reason">เหตุผล</label>
            <textarea 
              id="reason" 
              v-model="leaveForm.reason" 
              rows="4" 
              placeholder="กรุณาระบุเหตุผลในการลา..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="contact">เบอร์ติดต่อกรณีฉุกเฉิน</label>
            <input 
              id="contact" 
              type="tel" 
              v-model="leaveForm.contact" 
              placeholder="08x-xxx-xxxx"
            >
          </div>

          <button type="submit" class="btn btn-primary">
            <span class="btn-icon">📝</span>
            ส่งคำขอลา
          </button>
        </form>
      </div>
    </div>

    <div class="leave-history">
      <h3>ประวัติการขอลา</h3>
      
      <div class="filter-section">
        <select v-model="selectedStatus" @change="filterLeaveRequests">
          <option value="">สถานะทั้งหมด</option>
          <option value="pending">รอการอนุมัติ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="rejected">ไม่อนุมัติ</option>
        </select>
      </div>

      <div class="leave-list">
        <div v-for="request in filteredLeaveRequests" :key="request.id" class="leave-item">
          <div class="leave-header">
            <div class="leave-type">
              <span class="type-icon">{{ getTypeIcon(request.type) }}</span>
              <span class="type-text">{{ getTypeText(request.type) }}</span>
            </div>
            <div class="leave-status" :class="request.status">
              {{ getStatusText(request.status) }}
            </div>
          </div>
          
          <div class="leave-details">
            <div class="requester">
              <span class="requester-label">ผู้ขอ:</span>
              <span class="requester-value">{{ request.requester?.name || request.requester?.email || 'ไม่ทราบผู้ขอ' }}</span>
            </div>
            <div class="date-range">
              <span class="date-label">วันที่ลา:</span>
              <span class="date-value">{{ formatDateRange(request.startDate, request.endDate) }}</span>
            </div>
            <div class="reason">
              <span class="reason-label">เหตุผล:</span>
              <span class="reason-value">{{ request.reason }}</span>
            </div>
            <div v-if="request.contact" class="contact">
              <span class="contact-label">ติดต่อ:</span>
              <span class="contact-value">{{ request.contact }}</span>
            </div>
          </div>
          
            <div class="leave-footer">
              <span class="submit-date">ส่งเมื่อ: {{ formatDate(request.submitDate) }}</span>
              <div v-if="request.approveDate" class="approve-date">
                {{ getStatusText(request.status) }}เมื่อ: {{ formatDate(request.approveDate) }}
              </div>

              <div class="admin-actions" v-if="auth.user && auth.user.role === 'admin'">
                <template v-if="request.status === 'pending'">
                  <button class="btn btn-approve" @click="approveRequest(request.id)">อนุมัติ</button>
                  <button class="btn btn-reject" @click="rejectRequest(request.id)">ไม่อนุมัติ</button>
                </template>
              </div>
              <div class="approved-by" v-if="request.approvedBy">
                <small>ดำเนินการโดย: {{ request.approvedBy }}</small>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../stores/auth'

export default {
  name: 'LeaveRequest',
  setup() {
    const auth = useAuth()
    const leaveForm = ref({
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      contact: ''
    })

    const selectedStatus = ref('')
    
    const leaveRequests = ref([
      {
        id: 1,
        type: 'sick',
        startDate: '2024-01-15',
        endDate: '2024-01-16',
        reason: 'ป่วยไข้หวัดใหญ่',
        contact: '081-234-5678',
        status: 'approved',
        submitDate: '2024-01-14T09:12:00.000Z',
        approveDate: '2024-01-14T10:30:00.000Z',
        requester: { email: 'user@example.com', name: 'Normal User' },
        approvedBy: 'admin@example.com'
      },
      {
        id: 2,
        type: 'personal',
        startDate: '2024-01-20',
        endDate: '2024-01-20',
        reason: 'ไปทำธุระส่วนตัว',
        contact: '081-234-5678',
        status: 'pending',
        submitDate: '2024-01-18T14:05:00.000Z',
        approveDate: null,
        requester: { email: 'user2@example.com', name: 'Jane Doe' },
        approvedBy: null
      },
      {
        id: 3,
        type: 'vacation',
        startDate: '2024-01-25',
        endDate: '2024-01-27',
        reason: 'พักผ่อนกับครอบครัว',
        contact: '081-234-5678',
        status: 'rejected',
        submitDate: '2024-01-20T08:30:00.000Z',
        approveDate: '2024-01-22T11:45:00.000Z',
        requester: { email: 'user3@example.com', name: 'John Smith' },
        approvedBy: 'admin@example.com'
      }
    ])

    const filteredLeaveRequests = computed(() => {
      if (!selectedStatus.value) {
        return leaveRequests.value
      }
      return leaveRequests.value.filter(request => request.status === selectedStatus.value)
    })

    const submitLeaveRequest = () => {
      const newRequest = {
        id: Date.now(),
        ...leaveForm.value,
        status: 'pending',
  submitDate: new Date().toISOString(),
  approveDate: null,
        requester: auth.user ? { email: auth.user.email, name: auth.user.name, role: auth.user.role } : { email: 'guest', name: 'Guest' },
        approvedBy: null
      }
      
      leaveRequests.value.unshift(newRequest)
      
      // บันทึกลง localStorage
      localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests.value))
      
      // รีเซ็ตฟอร์ม
      leaveForm.value = {
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
        contact: ''
      }
      
      alert('ส่งคำขอลาเรียบร้อยแล้ว')
    }

    const approveRequest = (requestId) => {
      const idx = leaveRequests.value.findIndex(r => r.id === requestId)
      if (idx === -1) return
      leaveRequests.value[idx].status = 'approved'
  leaveRequests.value[idx].approveDate = new Date().toISOString()
      // record approver
      leaveRequests.value[idx].approvedBy = auth.user ? auth.user.email : 'unknown'
      localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests.value))
    }

    const rejectRequest = (requestId) => {
      const idx = leaveRequests.value.findIndex(r => r.id === requestId)
      if (idx === -1) return
      leaveRequests.value[idx].status = 'rejected'
  leaveRequests.value[idx].approveDate = new Date().toISOString()
      // record approver
      leaveRequests.value[idx].approvedBy = auth.user ? auth.user.email : 'unknown'
      localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests.value))
    }

    const getTypeIcon = (type) => {
      const icons = {
        sick: '🤒',
        personal: '🏠',
        vacation: '🏖️',
        maternity: '👶',
        other: '📋'
      }
      return icons[type] || '📋'
    }

    const getTypeText = (type) => {
      const texts = {
        sick: 'ลาป่วย',
        personal: 'ลากิจส่วนตัว',
        vacation: 'ลาพักผ่อน',
        maternity: 'ลาคลอด',
        other: 'อื่นๆ'
      }
      return texts[type] || 'อื่นๆ'
    }

    const getStatusText = (status) => {
      const texts = {
        pending: 'รอการอนุมัติ',
        approved: 'อนุมัติแล้ว',
        rejected: 'ไม่อนุมัติ'
      }
      return texts[status] || 'ไม่ทราบสถานะ'
    }

    const formatDateRange = (startDate, endDate) => {
      const start = new Date(startDate).toLocaleDateString('th-TH')
      const end = new Date(endDate).toLocaleDateString('th-TH')
      
      if (startDate === endDate) {
        return start
      }
      return `${start} - ${end}`
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const d = new Date(dateString)
      return d.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const filterLeaveRequests = () => {
      // การกรองจะทำงานผ่าน computed property
    }

    onMounted(() => {
      // โหลดข้อมูลจาก localStorage
      const savedRequests = localStorage.getItem('leaveRequests')
      if (savedRequests) {
        leaveRequests.value = JSON.parse(savedRequests)
      }
    })

    return {
      leaveForm,
      selectedStatus,
      leaveRequests,
      filteredLeaveRequests,
      submitLeaveRequest,
      approveRequest,
      rejectRequest,
      auth,
      getTypeIcon,
      getTypeText,
      getStatusText,
      formatDateRange,
      formatDate,
      filterLeaveRequests
    }
  }
}
</script>


<style scoped>
.leave-request {
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

.leave-form {
  margin-bottom: 3rem;
}

.form-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(17,17,17,0.06);
  border: 1px solid rgba(17,17,17,0.04);
}

.form-card h3 {
  color: #111;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
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

.leave-history {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.leave-history h3 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section select {
  padding: 0.75rem 1rem;
  border: 2px solid rgba(17,17,17,0.06);
  border-radius: 8px;
  font-size: 1rem;
  background: #fffef8;
  cursor: pointer;
}

.filter-section select:focus {
  outline: none;
  border-color: #667eea;
}

.leave-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.leave-item {
  padding: 1.5rem;
  background: #fffef8;
  border-radius: 10px;
  border-left: 6px solid var(--color-yellow-300);
}

.leave-item:nth-child(odd) {
  background: #ffffff;
}

.leave-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.leave-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-icon {
  font-size: 1.5rem;
}

.type-text {
  font-weight: 500;
  color: #333;
}

.leave-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}

.leave-status.pending {
  background: var(--color-yellow-200);
  color: #665500;
}

.leave-status.approved {
  background: rgba(0,0,0,0.06);
  color: #111;
}

.leave-status.rejected {
  background: rgba(0,0,0,0.04);
  color: #111;
}

.leave-details {
  margin-bottom: 1rem;
}

.date-range,
.reason,
.contact {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.requester {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.requester-label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}
.requester-value {
  color: #333;
}
.approved-by {
  margin-top: 8px;
  color: #444;
}

.date-label,
.reason-label,
.contact-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.date-value,
.reason-value,
.contact-value {
  color: #333;
}

.leave-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

.submit-date,
.approve-date {
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .leave-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .leave-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .date-range,
  .reason,
  .contact {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .date-label,
  .reason-label,
  .contact-label {
    min-width: auto;
  }
}

.admin-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-approve {
  background: #111;
  color: var(--color-yellow);
  border: 1px solid rgba(17,17,17,0.12);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-reject {
  background: transparent;
  color: #111;
  border: 1px solid rgba(17,17,17,0.12);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}
</style>
