import Head from 'next/head'
import NavigationBar from '@/components/navigation-bar'
import AboutPage from '@/components/about-page'

export default function About() {
  return (
    <>
      <Head>
        <title>About - BIT GROUP C</title>
        <meta name="description" content="About BIT Group C Attendance System" />
      </Head>

      <NavigationBar />
      <AboutPage />
    </>
  )
}
