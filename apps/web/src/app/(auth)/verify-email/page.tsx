export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-bold">Verificar Email</h1>
      <div className="space-y-4">
        <p className="text-gray-600">
          Enviamos um link de verificação para seu email.
        </p>
        <p className="text-sm text-gray-500">
          Não recebeu o email? Verifique sua caixa de spam ou solicite um novo link.
        </p>
        <button
          type="button"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reenviar Email de Verificação
        </button>
      </div>
    </div>
  )
}