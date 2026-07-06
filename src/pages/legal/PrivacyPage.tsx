import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';

/**
 * BORRADOR editable de Política de Privacidad.
 * NOTA: Este texto es una plantilla base conforme a la Ley N° 19.628 sobre
 * Protección de la Vida Privada y la Ley N° 21.719, y debe ser revisado y
 * validado por un abogado antes de su uso en producción. Reemplaza los
 * marcadores [entre corchetes] con los datos reales de la empresa.
 */
export default function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" updated="6 de julio de 2026">
      <p>
        En MediHistory valoramos y protegemos tu privacidad. Esta Política de Privacidad describe
        cómo [Nombre de la empresa] (el «Responsable») recopila, utiliza, almacena y protege
        tus datos personales, incluidos tus datos sensibles de salud, en cumplimiento de la
        Ley N° 19.628 sobre Protección de la Vida Privada y la Ley N° 21.719.
      </p>

      <LegalSection heading="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos es [Nombre de la empresa], RUT
          [__.___.___-_], con domicilio en [dirección]. Para ejercer tus derechos o realizar
          consultas, escríbenos a{' '}
          <a href="mailto:[correo de contacto]" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            [correo de contacto]
          </a>.
        </p>
      </LegalSection>

      <LegalSection heading="2. Datos que recopilamos">
        <p>Recopilamos los siguientes datos que tú nos proporcionas:</p>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong>Datos de identificación:</strong> nombre, correo electrónico y fecha de nacimiento.</li>
          <li>
            <strong>Datos sensibles de salud:</strong> historial clínico, medicamentos, exámenes,
            alergias, vacunas, signos vitales, tipo de sangre y contactos de emergencia.
          </li>
          <li><strong>Datos técnicos:</strong> información necesaria para el funcionamiento y la seguridad del servicio.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Finalidad del tratamiento">
        <p>Utilizamos tus datos exclusivamente para:</p>
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Prestar el servicio de registro y consulta de tu información médica personal.</li>
          <li>Permitirte compartir voluntariamente tu historial con profesionales de la salud.</li>
          <li>Garantizar la seguridad de tu cuenta y del servicio.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Base legal y consentimiento">
        <p>
          El tratamiento de tus datos, en especial los datos sensibles de salud, se basa en tu
          consentimiento libre, informado y específico, otorgado al registrarte y aceptar esta
          Política. Puedes revocar tu consentimiento en cualquier momento, sin efecto
          retroactivo, conforme a la legislación vigente.
        </p>
      </LegalSection>

      <LegalSection heading="5. Compartir información con terceros">
        <p>
          Tu información médica solo se comparte cuando tú lo decides, mediante los códigos de
          acceso o códigos QR que generas para que un profesional de la salud consulte tu
          historial. No vendemos ni cedemos tus datos a terceros con fines comerciales.
        </p>
        <p>
          Podremos revelar información cuando exista una obligación legal o un requerimiento de
          autoridad competente.
        </p>
      </LegalSection>

      <LegalSection heading="6. Seguridad de los datos">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra
          el acceso no autorizado, pérdida o alteración. No obstante, ningún sistema es
          completamente infalible, por lo que no podemos garantizar una seguridad absoluta.
        </p>
      </LegalSection>

      <LegalSection heading="7. Conservación de los datos">
        <p>
          Conservamos tus datos mientras mantengas una cuenta activa o mientras sean necesarios
          para las finalidades descritas. Si eliminas tu cuenta, tus datos serán suprimidos o
          anonimizados, salvo que la ley exija su conservación por un plazo mayor.
        </p>
      </LegalSection>

      <LegalSection heading="8. Tus derechos">
        <p>
          De acuerdo con la legislación aplicable, tienes derecho a acceder, rectificar,
          cancelar y oponerte al tratamiento de tus datos personales, así como a solicitar su
          portabilidad. Para ejercerlos, contáctanos en{' '}
          <a href="mailto:[correo de contacto]" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            [correo de contacto]
          </a>.
        </p>
      </LegalSection>

      <LegalSection heading="9. Cambios a esta Política">
        <p>
          Podremos actualizar esta Política de Privacidad. Cualquier cambio se publicará en
          esta página con su fecha de actualización. Te recomendamos revisarla periódicamente.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contacto">
        <p>
          Si tienes preguntas sobre esta Política o sobre el tratamiento de tus datos, escríbenos
          a{' '}
          <a href="mailto:[correo de contacto]" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            [correo de contacto]
          </a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
