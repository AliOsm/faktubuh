import { csrfToken } from "@/lib/utils"
import GoogleIcon from "@/components/icons/google-icon"
import { Button } from "@/components/ui/button"
import { usersOmniauthCallbacks } from "@/api"

export default function SigninWithGoogleButton() {
  return (
    <form action={usersOmniauthCallbacks.passthru.path()} method="post">
      <input type="hidden" name="authenticity_token" value={csrfToken()} autoComplete="off"></input>

      <Button type="submit" variant="outline">
        <GoogleIcon className="me-1 size-4" />

        تسجيل الدخول باستخدام Google
      </Button>
    </form>
  )
}
