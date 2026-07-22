import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';

/**
 * BORRADOR editable de Términos de Uso.
 * NOTA: Este texto es una plantilla base y debe ser revisado y validado por
 * un abogado antes de su uso en producción. Reemplaza los marcadores
 * [entre corchetes] con los datos reales de la empresa.
 */
export default function TermsPage() {
  return (
    <LegalLayout title="Términos de Uso" updated="22 de julio de 2026">
      <p>
        Bienvenido a MediHistory. Estos Términos de Uso (los «Términos») regulan el acceso y
        uso de la aplicación MediHistory (la «Plataforma»), operada por Jesús Medina,
        RUT 17.021.601-6, con domicilio en Av. Padre Hurtado 13941, San Bernardo (el «Titular»). Al registrarte o
        utilizar la Plataforma, aceptas estos Términos en su totalidad.
      </p>

      <LegalSection heading="1. Aceptación de los Términos">
        <p>
          El uso de la Plataforma implica la aceptación plena de estos Términos y de la
          Política de Privacidad. Si no estás de acuerdo con ellos, debes abstenerte de
          utilizar la Plataforma.
        </p>
      </LegalSection>

      <LegalSection heading="2. Descripción del servicio">
        <p>
          MediHistory es una herramienta que permite a las personas registrar, organizar y
          consultar su información médica personal (historial clínico, medicamentos,
          exámenes, alergias y vacunas), así como compartirla de forma voluntaria con
          profesionales de la salud mediante códigos de acceso.
        </p>
        <p>
          <strong>MediHistory no presta servicios médicos.</strong> La Plataforma es un registro
          personal de información y no sustituye la consulta, diagnóstico o tratamiento de un
          profesional de la salud. Ante cualquier urgencia o duda médica, acude a un
          profesional o a un servicio de emergencia.
        </p>
      </LegalSection>

      <LegalSection heading="3. Cuenta de usuario">
        <p>
          Para usar la Plataforma debes crear una cuenta con información veraz y actualizada.
          Eres responsable de mantener la confidencialidad de tus credenciales y de toda
          actividad que ocurra bajo tu cuenta. Notifícanos de inmediato ante cualquier uso no
          autorizado.
        </p>
      </LegalSection>

      <LegalSection heading="4. Uso permitido">
        <p>Al utilizar la Plataforma, te comprometes a:</p>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Ingresar únicamente información sobre la que tengas derecho.</li>
          <li>No utilizar la Plataforma con fines ilícitos o no autorizados.</li>
          <li>No intentar vulnerar la seguridad ni el funcionamiento del servicio.</li>
          <li>No suplantar la identidad de terceros.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Responsabilidad sobre la información médica">
        <p>
          La información registrada en la Plataforma es proporcionada y gestionada por ti. El
          Titular no verifica la exactitud de dicha información y no se responsabiliza por
          decisiones tomadas en base a ella. Al compartir tu historial mediante un código de
          acceso, autorizas al profesional que lo reciba a consultar dicha información.
        </p>
      </LegalSection>

      <LegalSection heading="6. Propiedad intelectual">
        <p>
          La Plataforma, su diseño, marca, logotipos y código son propiedad del Titular o de
          sus licenciantes y están protegidos por la legislación aplicable. La información
          médica que ingresas sigue siendo de tu propiedad.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitación de responsabilidad">
        <p>
          La Plataforma se ofrece «tal cual» y «según disponibilidad». En la medida permitida
          por la ley, el Titular no será responsable por daños indirectos, pérdida de datos o
          perjuicios derivados del uso o de la imposibilidad de uso de la Plataforma.
        </p>
      </LegalSection>

      <LegalSection heading="8. Modificaciones">
        <p>
          El Titular podrá modificar estos Términos en cualquier momento. Los cambios serán
          publicados en esta página con su fecha de actualización. El uso continuado de la
          Plataforma tras dichos cambios constituye la aceptación de los mismos.
        </p>
      </LegalSection>

      <LegalSection heading="9. Legislación aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por las leyes de la República de Chile. Cualquier
          controversia se someterá a los tribunales competentes de Santiago, Chile.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contacto">
        <p>
          Para consultas sobre estos Términos, escríbenos a{' '}
          <a href="mailto:jesus.medina@medi-history.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            jesus.medina@medi-history.com
          </a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
