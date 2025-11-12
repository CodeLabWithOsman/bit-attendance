import Head from 'next/head'
import NavigationBar from '@/components/navigation-bar'
import AdminPrank from '@/components/admin-prank'

export default function TryHackMe() {
  return (
    <>
      <Head>
        <title>Admin Panel - BIT GROUP C</title>
        <meta name="description" content="Admin Panel for BIT Group C" />
      </Head>

      <NavigationBar />
      <AdminPrank />
    </>
  )
}
