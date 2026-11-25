import Gallery from "@/components/Gallery";
import ThemeToggle from "@/components/ThemeToggle";
import Testimonials from "@/components/Testimonials";
import {
  categories,
  discordHref,
  profile,
  socials,
  testimonials,
} from "@/lib/content";

export default function Home() {
  return (
    <>
      <header className="header">
        <strong>{profile.name}</strong>
        <nav>
          <a href="#creations">Créations</a>
          <a href="#avis">Avis</a>
          <a href="#contact">Contact</a>
        </nav>
        <ThemeToggle />
      </header>

      <section className="hero">
        <div className="reveal">
          <h1>{profile.name}</h1>
          <p className="role">{profile.role}</p>
        </div>
        <div className="about reveal">
          <div className="pdp">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt={profile.name} />
            ) : null}
          </div>
          <p>{profile.about}</p>
        </div>
      </section>

      <section className="section" id="creations">
        <h2>Créations</h2>
        <Gallery categories={categories} />
      </section>

      <section className="section" id="avis">
        <h2>Avis</h2>
        <Testimonials items={testimonials} />
      </section>

      <footer className="contact" id="contact">
        <h2>Tu as un projet ?<br />Parlons-en.</h2>
        <div className="dock">
          {socials.map((s) => (
            <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
          {discordHref ? (
            <a href={discordHref} target="_blank" rel="noopener noreferrer">
              Discord
            </a>
          ) : null}
        </div>
      </footer>
    </>
  );
}
