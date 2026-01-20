import Footer from './_components/footer'
import Header from './_components/header'
import Heroes from './_components/heroes'

const MarketingPage = () => {
  return (
    <div className="flex min-h-full flex-col px-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-y-8 pb-10 text-center md:justify-start">
        <Header></Header>
        <Heroes></Heroes>
      </div>
      <Footer></Footer>
    </div>
  )
}

export default MarketingPage
