import { Navigate, Route, Routes } from 'react-router-dom'
import Billing from './routes/Billing.jsx'
import Checkout from './routes/Checkout.jsx'
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
import Pricing from './routes/Pricing.jsx'
import ScrollToTop from './routes/ScrollToTop.jsx'
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
