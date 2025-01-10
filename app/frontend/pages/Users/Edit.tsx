import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, usePage } from '@inertiajs/react'

export default function Edit() {
  const { current_user } = usePage().props

  const { data, setData, put, processing, errors } = useForm({
    user: {
      first_name: current_user.first_name === "غير محدد" ? "" : current_user.first_name,
      last_name: current_user.last_name === "غير محدد" ? "" : current_user.last_name
    }
  })

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    put('/users')
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    setData((prevData) => ({
      user: {
        ...prevData.user,
        [name]: value
      }
    }))
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col w-full items-center justify-center p-8">

          <form onSubmit={submit}>
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
                <CardDescription>إعدادات حسابك في فاكتبوه.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">البريد الإلكتروني</Label>
                    <Input type="email" value={current_user.email} placeholder="البريد الإلكتروني" readOnly={true} />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">الإسم الأول</Label>
                    <Input name="first_name" type="text" value={data.user.first_name} onChange={handleInputChange} placeholder="الإسم الأول" />
                    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">الإسم الأخير</Label>
                    <Input name="last_name" type="text" value={data.user.last_name} onChange={handleInputChange} placeholder="الإسم الأخير" />
                    {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="submit" disabled={processing}>{current_user.information_confirmed ? "تحديث" : "تأكيد البيانات"}</Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </Layout>
  )
}
