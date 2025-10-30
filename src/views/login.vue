<template>
	<div class="login-page">
		<div class="card">
			<h1 class="title">Sign in</h1>

			<form @submit.prevent="onSubmit" novalidate>
				<div class="field">
					<label for="email">Email</label>
					<input id="email" type="email" v-model="form.email" autocomplete="username" />
					<p v-if="errors.email" class="error">{{ errors.email }}</p>
				</div>

				<div class="field">
					<label for="password">Password</label>
					<input id="password" type="password" v-model="form.password" autocomplete="current-password" />
					<p v-if="errors.password" class="error">{{ errors.password }}</p>
				</div>

				<div class="actions">
					<button type="submit" :disabled="loading">
						<span v-if="!loading">Sign in</span>
						<span v-else>Signing…</span>
					</button>
				</div>

				<p v-if="serverError" class="server-error">{{ serverError }}</p>
			</form>
		</div>
	</div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/auth'
import { AuthApi } from '../api/client'

const router = useRouter && useRouter()
const auth = useAuth()

const form = reactive({
	email: '',
	password: ''
})

const loading = ref(false)
const serverError = ref('')

const errors = computed(() => {
	const e = { email: '', password: '' }
	if (!form.email) e.email = 'Email is required.'
	else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email.'

	if (!form.password) e.password = 'Password is required.'
	else if (form.password.length < 4) e.password = 'Password must be at least 4 characters.'

	return e
})

function hasValidationErrors() {
	return !!(errors.value.email || errors.value.password)
}

async function onSubmit() {
    serverError.value = ''
    if (hasValidationErrors()) return
    loading.value = true
    try {
        const { token, user } = await AuthApi.login(form.email, form.password)
        auth.setUser({ email: user.email, name: user.name, role: user.role }, token)
        try { router && router.push({ path: '/' }) } catch { router && router.push('/') }
    } catch (err) {
        serverError.value = err?.message || 'Unexpected error. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
		background: linear-gradient(180deg, var(--color-surface), var(--color-surface-2));
	padding: 24px;
}
.card {
	width: 100%;
	max-width: 420px;
		background: var(--color-surface-2);
	padding: 28px;
	border-radius: 10px;
	box-shadow: 0 8px 30px rgba(17,17,17,0.06);
	border: 1px solid rgba(17,17,17,0.04);
}
.title {
	margin: 0 0 16px 0;
	font-size: 22px;
	text-align: center;
		color: var(--color-dark);
}
.field {
	margin-bottom: 12px;
}
.field label {
	display: block;
	font-size: 13px;
	margin-bottom: 6px;
}
.field input {
	width: 100%;
	padding: 10px 12px;
	border: 1px solid #dfe6ef;
	border-radius: 6px;
	font-size: 14px;
}
.actions {
	margin-top: 12px;
}
.actions button {
	width: 100%;
	padding: 10px 12px;
			background: var(--color-yellow);
			border: none;
			color: var(--color-dark);
			font-weight: 700;
	border-radius: 6px;
	cursor: pointer;
			box-shadow: var(--shadow-md);
}
.actions button:disabled {
	opacity: 0.7;
	cursor: default;
}
.error {
	color: #d9534f;
	font-size: 12px;
	margin-top: 6px;
}
.server-error {
	color: #a11;
	margin-top: 12px;
	text-align: center;
}
</style>

