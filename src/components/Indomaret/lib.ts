const REFRESH_TOKEN_URL =
  'https://api-klik.klikindomaret.com/customer/api/mobile/authentication/refresh-token'

export const refreshJwtToken = async (
  refreshToken: string,
  accessToken: string,
  signature: string
) => {
  let body = {
    accessToken: 'Bearer ' + accessToken,
    refreshToken
  }

  const req = await fetch(REFRESH_TOKEN_URL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Signature: signature
    }
  })
  if (req.status >= 400) throw 'Error on view QR'

  return req.json()
}

const VIEW_QR_URL = 'https://api-klik.klikindomaret.com/customer/api/mobile/wallet/viewQRcode'
export const viewQR = async (accessToken: string) => {
  const req = await fetch(VIEW_QR_URL, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: 'Bearer ' + accessToken,
      Signature:
        'WJYf+JoBCQqtPHUGEpRx4I9xDwmYeE8lK6zJGqUYtpf9PAjTEw0D3xCc47kMdHCrPHfabR5Q1n6s4BAAojl0hkSkAAf7NxExiOkSkb4TyaJO8QHcp+IdC2Hpve6o/e88M2zXFmOvnOOKIPWXEMb7ZHUgBh0M3r8O6Mp722Ck/XlR1vFdL+0l7gX8734jCEJZGAmsSvGfWWuhakNXxQoU7S3zlBlW2cfhbU8hV5z06CsNnWxJJZdZ6Tjt9exr+BYygHczc3lrnLzAsyS5VUVVnxTep9HyzM6APh1suJ5Fws0GqPd/Ev9qdeReUQHf51tX4cqNvn/iFup0/zoNPEhKyw=='
    }
  })

  if (req.status >= 400) throw 'Error on view QR'

  return req.json()
}
