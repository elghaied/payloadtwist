export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runAuthMigrations } = await import('@/db/migrate')
    try {
      await runAuthMigrations()
    } catch (err) {
      console.error('Auth DB migration failed:', err)
    }
  }
}
