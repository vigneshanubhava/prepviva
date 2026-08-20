import { Navigate, Route, Routes } from 'react-router-dom'
import Billing from './routes/Billing.jsx'
import Checkout from './routes/Checkout.jsx'
import Dashboard from './routes/Dashboard.jsx'
import EmailCanceled from './routes/EmailCanceled.jsx'
import EmailMagicLink from './routes/EmailMagicLink.jsx'
import GeneratingLink from './routes/GeneratingLink.jsx'
import SigningIn from './routes/SigningIn.jsx'
import Onboarding from './routes/Onboarding.jsx'
import KitchenSink from './routes/KitchenSink.jsx'
import LinkSent from './routes/LinkSent.jsx'
import Login from './routes/Login.jsx'
import ManagePlan from './routes/ManagePlan.jsx'
import NotBuilt from './routes/NotBuilt.jsx'
import PreparingAccount from './routes/PreparingAccount.jsx'
import Practice from './routes/Practice.jsx'
import Performance from './routes/Performance.jsx'
import Pricing from './routes/Pricing.jsx'
import Report from './routes/Report.jsx'
import ScrollToTop from './routes/ScrollToTop.jsx'
import SessionConfig from './routes/SessionConfig.jsx'
import SessionRoom from './routes/SessionRoom.jsx'
import Sessions from './routes/Sessions.jsx'
import Settings from './routes/Settings.jsx'
import Signup from './routes/Signup.jsx'
import Welcome from './routes/Welcome.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/pricing" replace />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/checkout" element={<Checkout />} />
        <Route path="/signup/preparing" element={<PreparingAccount />} />
        <Route path="/signup/welcome" element={<Welcome />} />

        {/* magic-link login — simulated end to end, no email is sent */}
        <Route path="/login" element={<Login />} />
        <Route path="/login/sending" element={<GeneratingLink />} />
        <Route path="/login/link-sent" element={<LinkSent />} />
        <Route path="/login/email" element={<EmailMagicLink />} />
        <Route path="/login/signing-in" element={<SigningIn />} />

        {/* First-run setup — a page of its own, outside the app shell. */}
        <Route path="/welcome/setup" element={<Onboarding />} />

        {/* signed-in app */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* practice: the CV gate and track picker, then the configurator */}
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:trackId" element={<SessionConfig />} />
        {/* where Start lands — the room is not built, and says so */}
        <Route path="/practice/:trackId/room" element={<SessionRoom />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/sessions/:trackId/:index" element={<Report />} />
        <Route path="/performance" element={<Performance />} />
        {/* settings — one route per section, so a section can be linked */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/:section" element={<Settings />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/billing/manage-plan" element={<ManagePlan />} />
        {/* the cancellation confirmation, in the same simulated inbox */}
        <Route path="/billing/canceled-email" element={<EmailCanceled />} />

        <Route path="/kitchen-sink" element={<KitchenSink />} />
        {/* anything linked from a built screen but not yet built */}
        <Route path="*" element={<NotBuilt />} />
      </Routes>
    </>
  )
}
