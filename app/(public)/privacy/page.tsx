import Link from "next/link";
import type { Metadata } from "next";

import { PublicLegalFooter } from "../_components/public-legal-footer";
import { PUBLIC_SITE_NAME, getPublicContactEmail } from "@/lib/public-site-config";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: `Datenschutzerklärung für die öffentliche Website ${PUBLIC_SITE_NAME} mit Angaben zu Hosting, Kontaktanfragen, Cookies und optionaler Analytics.`,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `Datenschutzerklärung | ${PUBLIC_SITE_NAME}`,
    description: `Datenschutzerklärung für die öffentliche Website ${PUBLIC_SITE_NAME} mit Angaben zu Hosting, Kontaktanfragen, Cookies und optionaler Analytics.`,
    url: "/privacy",
  },
};

const contactEmail = getPublicContactEmail();

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-slate-900">Datenschutzerklärung</h1>
      <p className="mt-4 text-sm leading-6 text-slate-700">
        Stand: 12. August 2026. Diese Datenschutzerklärung gilt für die öffentliche Website{" "}
        {PUBLIC_SITE_NAME} mit ihren Informationsseiten, Artikelseiten, dem Kontaktbereich und dem
        öffentlichen Quiz-Teaser.
      </p>

      <section className="mt-8 space-y-4 text-sm leading-6 text-slate-700">
        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">1. Verantwortlicher</h2>
          <div className="mt-3">
            <p>Verantwortlich im Sinne von Art. 4 Nr. 7 DSGVO ist:</p>
            <p className="mt-3 font-medium text-slate-900">Valerii Serputko</p>
            <p>Gudrunstraße 134</p>
            <p>44319 Dortmund</p>
            <p>Deutschland</p>
            <p className="mt-3">
              Weitere Kontaktangaben findest du im{" "}
              <Link className="underline underline-offset-2" href="/impressum">
                Impressum
              </Link>{" "}
              und auf der{" "}
              <Link className="underline underline-offset-2" href="/contact">
                Kontaktseite
              </Link>
              .
            </p>
            <p className="mt-3">
              Die öffentliche E-Mail-Adresse{" "}
              <span className="font-medium text-slate-900">{contactEmail}</span> ist derzeit noch
              nicht betriebsbereit. Bitte nutze bis zur Aktivierung das Kontaktformular auf dieser
              Website.
            </p>
          </div>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            2. Hosting und technische Server-Protokolle
          </h2>
          <p className="mt-3">
            Die Website wird auf einer eigenbetriebenen Infrastruktur bei Hetzner Online GmbH in
            Deutschland gehostet.
          </p>
          <p className="mt-3">
            Beim Aufruf der Website werden technisch erforderliche Server-Protokolle verarbeitet.
            Dazu gehören insbesondere IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Referrer,
            Browser-Informationen sowie sicherheitsrelevante Statusdaten. Diese Verarbeitung ist
            erforderlich, um die Website sicher und stabil bereitzustellen.
          </p>
          <p className="mt-3">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse liegt in
            der sicheren Bereitstellung, Fehleranalyse und Missbrauchsabwehr.
          </p>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">3. Kontaktanfragen</h2>
          <p className="mt-3">
            Wenn du über das Kontaktformular eine Anfrage sendest, verarbeite ich die von dir
            eingegebenen Angaben und den Inhalt deiner Nachricht, soweit dies zur Bearbeitung
            deiner Anfrage erforderlich ist.
          </p>
          <p className="mt-3">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit es um die Anbahnung oder
            Bearbeitung einer konkreten Anfrage geht. Im Übrigen erfolgt die Verarbeitung auf
            Grundlage von Art. 6 Abs. 1 lit. f DSGVO wegen des berechtigten Interesses an einer
            geordneten Kommunikation.
          </p>
          <p className="mt-3">
            Die öffentliche E-Mail-Adresse {contactEmail} ist derzeit noch nicht betriebsbereit.
            Ein separater externer Mail-Dienst ist aktuell nicht dokumentiert.
          </p>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            4. Cookies und einwilligungsbasierte Analytics
          </h2>
          <p className="mt-3">
            Für den Quiz-Teaser wird ein technisch notwendiges Cookie gesetzt. Es dient dazu, die
            Funktion des Quiz-Teasers bereitzustellen und Missbrauch zu begrenzen.
          </p>
          <p className="mt-3">
            Zusätzlich werden Nutzungsdaten für Website-Analytics nur dann verarbeitet, wenn du
            zuvor ausdrücklich eingewilligt hast. Die Analytics dienen dazu, die Nutzung der
            Website besser zu verstehen und das Angebot weiterzuentwickeln.
          </p>
          <p className="mt-3">
            Rechtsgrundlage für das technisch notwendige Cookie ist Art. 6 Abs. 1 lit. f DSGVO
            sowie, soweit anwendbar, § 25 Abs. 2 TTDSG. Rechtsgrundlage für die Analytics ist
            deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO sowie, soweit anwendbar, § 25
            Abs. 1 TTDSG.
          </p>
          <p className="mt-3">
            Es ist derzeit kein separater externer Tracking-Anbieter für diese öffentliche Website
            dokumentiert.
          </p>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">5. Speicherdauer</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Technisch notwendiges Quiz-Teaser-Cookie: bis zu 30 Tage.
            </li>
            <li>
              Analytics-Ereignisse: 90 Tage.
            </li>
            <li>
              Kontaktanfragen: 6 Monate nach der letzten Bearbeitung, sofern keine gesetzliche
              oder sonstige berechtigte Aufbewahrungspflicht eine längere Speicherung erfordert.
            </li>
            <li>
              Server-, Proxy- und Sicherheitsprotokolle: 14 Tage; länger nur bei einem
              Sicherheitsvorfall oder zur Missbrauchsaufklärung.
            </li>
          </ul>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            6. Empfänger und Verarbeitung durch Dienstleister
          </h2>
          <p className="mt-3">
            Empfänger deiner Daten sind in erster Linie der Verantwortliche selbst und die für den
            Betrieb dieser Website eingesetzten technischen Systeme.
          </p>
          <p className="mt-3">
            Das Hosting erfolgt bei Hetzner Online GmbH in Deutschland. Für die öffentliche
            Website ist derzeit kein separater externer Backup- oder Monitoring-Dienst
            dokumentiert.
          </p>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">7. Deine Rechte</h2>
          <p className="mt-3">
            Du hast nach Maßgabe der DSGVO insbesondere das Recht auf Auskunft, Berichtigung,
            Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen
            Verarbeitungen, die auf Art. 6 Abs. 1 lit. f DSGVO beruhen.
          </p>
          <p className="mt-3">
            Eine erteilte Einwilligung für Analytics kannst du jederzeit mit Wirkung für die
            Zukunft widerrufen, indem du deine Einwilligungseinstellungen änderst oder die
            betreffenden Browserdaten löschst.
          </p>
        </article>

        <article className="rounded-xl border border-white/70 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-slate-900">8. Beschwerderecht</h2>
          <p className="mt-3">
            Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, wenn du
            der Ansicht bist, dass die Verarbeitung deiner personenbezogenen Daten gegen die DSGVO
            verstößt. Zuständig am Sitz des Verantwortlichen ist insbesondere die Landesbeauftragte
            für Datenschutz und Informationsfreiheit Nordrhein-Westfalen.
          </p>
          <p className="mt-3">
            Informationen und Beschwerdemöglichkeiten findest du unter{" "}
            <a
              className="underline underline-offset-2"
              href="https://www.ldi.nrw.de/kontakt/ihre-beschwerde"
              target="_blank"
              rel="noopener noreferrer"
            >
              ldi.nrw.de/kontakt/ihre-beschwerde
            </a>
            .
          </p>
        </article>
      </section>
      <PublicLegalFooter />
    </main>
  );
}
