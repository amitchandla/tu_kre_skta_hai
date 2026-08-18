import Link from "next/link";

const steps = [
  { n: "01", title: "Tell us about your business", body: "Set up your Business Brain once — products, customers, offers, location." },
  { n: "02", title: "BizGrow AI understands your business", body: "No repeated prompts. Every feature already knows your context." },
  { n: "03", title: "Get daily growth recommendations", body: "A short, specific plan for today — not generic tips." },
  { n: "04", title: "Create and execute marketing tasks", body: "Reels, posts, follow-ups and ads, ready to approve and use." },
  { n: "05", title: "Track your progress", body: "Weekly reports on leads, customers and campaigns — real numbers only." },
];

const features = [
  { title: "Daily Growth Advisor", body: "A prioritized list of what matters today, built from your real leads, customers and offers." },
  { title: "Lead Management", body: "A simple pipeline from New to Won — with AI flagging the leads that need attention now." },
  { title: "Customer Management", body: "Know who's active, who's gone quiet, and who to reach out to." },
  { title: "AI Follow-up", body: "Follow-up messages drafted in your language, for every stage — you approve before anything sends." },
  { title: "Social Media Suggestions", body: "Concrete post ideas for Reels, Stories and Posts — not a blank prompt box." },
  { title: "AI Video Studio", body: "Professional, commercial-style marketing videos built from your real product photos." },
  { title: "Meta Ads", body: "Campaign ideas, ad copy and audience suggestions — you connect and approve before anything launches." },
  { title: "Customer Reactivation", body: "Find customers who haven't returned and reach them with a personal, approved message." },
  { title: "Business Reports", body: "A weekly summary of what happened and what to do next — never invented numbers." },
  { title: "AI Help", body: "Ask how to do anything in the app, in English, Hindi or Hinglish." },
];

export default function LandingPage() {
  return (
    <main>
      {/* Top nav */}
      <header className="border-b border-line bg-paper/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-xl font-semibold tracking-tight">BizGrow AI</span>
          <nav className="hidden gap-8 text-sm font-medium text-ink/70 md:flex">
            <a href="#how-it-works" className="hover:text-ink">How it works</a>
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-ink/70 hover:text-ink">Log in</Link>
            <Link href="/signup" className="btn-primary">Start 7 Days Free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-600">
              Your AI Business Growth Assistant
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Grow Your Business Smarter with AI
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/70">
              BizGrow AI understands your business and helps you decide what to do next — from customers and follow-ups to social media, videos and advertising.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary">Start 7 Days Free</Link>
              <a href="#how-it-works" className="btn-secondary">See How It Works</a>
            </div>
            <p className="mt-4 text-xs text-ink/50">No credit card required · Cancel anytime</p>
          </div>

          <div className="card p-3">
            <div className="rounded-[10px] border border-line bg-paper p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Today's Growth Plan</span>
                <span className="rounded-full bg-accent-400/10 px-2.5 py-1 text-xs font-semibold text-accent-500">Golden Pizza</span>
              </div>
              <ul className="space-y-3">
                {[
                  "5 leads need follow-up",
                  "Post an Instagram Reel today",
                  "Create an Instagram Story poll",
                  "18 customers haven't returned recently",
                  "Your weekend offer can be promoted",
                ].map((t) => (
                  <li key={t} className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3">
                    <span className="text-sm text-ink/80">{t}</span>
                    <span className="text-xs font-semibold text-brand-500">Do It →</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-line bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-5">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-display text-2xl text-brand-500/60">{s.n}</span>
                <h3 className="mt-2 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Everything your business needs to grow</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <h3 className="font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video section */}
      <section className="border-y border-line bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Create professional marketing videos for your business.
            </h2>
            <p className="mt-4 text-ink/70 leading-relaxed">
              Videos are designed to be realistic, professional and commercial-looking — built around your real products, not cartoons.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink/70">
              <li>• Photorealistic, premium advertising style by default</li>
              <li>• Uses your uploaded product photos, logo and brand assets</li>
              <li>• Ready for Reels, Stories, Meta Ads, WhatsApp Status and YouTube Shorts</li>
            </ul>
          </div>
          <div className="card aspect-video flex items-center justify-center bg-ink/5 text-sm text-ink/40">
            Video preview
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Simple pricing</h2>
          <p className="mt-2 text-ink/60">Start with a 7-day free trial. No card required.</p>
          <p className="mt-8 text-sm text-ink/50">
            Live plan pricing is managed from the Admin Panel and loads dynamically —{" "}
            <Link href="/signup" className="font-semibold text-brand-500 underline">start your free trial</Link> to see current plans.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-20 text-center text-white">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Start Growing Your Business</h2>
        <Link href="/signup" className="btn-primary mt-6 inline-flex bg-accent-400 hover:bg-accent-500">
          Start 7 Days Free
        </Link>
      </section>

      <footer className="border-t border-line py-10 text-center text-xs text-ink/40">
        © {new Date().getFullYear()} BizGrow AI. All rights reserved.
      </footer>
    </main>
  );
}
