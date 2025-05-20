import Header from './_components/header'
import Heroes from './_components/heroes'
import Footer from './_components/footer'
import Features from './_components/features'
import Testimonials from './_components/testimonials'
import Wiki from './_components/wiki'
import TeamMember from './_components/team-member'

const MarketingPage = () => {
    return (
        <div className="min-h-full flex flex-col px-4">
            <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 pb-10">
                <Header></Header>
                <Heroes></Heroes>
                <Wiki></Wiki>
                <Features></Features>
                <Testimonials></Testimonials>
                <TeamMember></TeamMember>
            </div>
            <Footer></Footer>
        </div>
    )
}

export default MarketingPage
