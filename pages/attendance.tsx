import Head from 'next/head'
import NavigationBar from '@/components/navigation-bar'
import StudentSearch from '@/components/student-search'

export default function AttendancePage() {
  return (
    <>
      <Head>
        <title>Mark Attendance - BIT GROUP C</title>
        <meta name="description" content="Mark your attendance for BIT Group C" />
      </Head>

      <NavigationBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 pt-20 pb-20 px-4">
        <StudentSearch />
      </div>
    </>
  )
}
