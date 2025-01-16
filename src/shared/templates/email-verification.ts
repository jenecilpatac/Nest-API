export default function emailVerification({
  name,
  verificationLink,
  from,
}: any) {
  return `<p>Hello, <strong>${name}</strong></p>
<br />
<p>Thank you for registering! Please click on the link below to verify your
  email address and complete your registration:
  <a target='_blank' href=${verificationLink}>Verify Now</a></p>
<br />
<p>If you did not create an account with us, please disregard this email.</p>
<br />
<br />
<p>Best regards,
  <strong>
    ${from}</strong></p>`;
}
