import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import axios from 'axios'
import moxios from 'moxios'
import { ContentTypeEnum, HandleEnum, WHEN_INJECT_PARAM_NO_ID_ERROR_DES, defineEasyAxios } from '..'
import { get } from '../../helpers'
import type { Config, DefineResponseResult, defineAPI } from '..'

const { http } = defineEasyAxios<'tokenOutDate'>({
  instance: axios.create({
    baseURL: 'v1',
    timeout: 10,
  }),
})

http.createDefaultStrategies((ins) => {
  return {
    showErrorMessageTip() {},
    showSuccessMessageTip() {},
    isSuccess: (res) => {
      return res.data?.success
    },
    getBackData: (type: HandleEnum, res) => {
      if (type === HandleEnum.SYSTEM_ERROR)
        return res

      return res.data?.data
    },
    getMessage: (_type: HandleEnum, res) => {
      if (ins.isSysError(res)) {
        const message = get(res, 'error.response.data.message', res.error.message)
        return message
      }
      return res.data?.message
    },
  }
})

const { instance } = http

describe('resutful', async () => {
  beforeEach(() => {
    moxios.install(instance)
  })

  afterEach(() => {
    moxios.uninstall(instance)
  })

  it('create config and back is ok', () => {
    const api = http.create<
      [
        defineAPI<'get', { name: string }, { name: string }>,
        defineAPI<'get1', { name: string }, { name: string }>,
        defineAPI<'get2', { name: string }, { name: string }>,
        defineAPI<'get3', { name: string }, { name: string }>,
        defineAPI<'get3', { name: string }, { name: string }>,
        defineAPI<'get4', { name: string }, { name: string }>,
        defineAPI<'get5', { name: string }, { name: string }>,
        defineAPI<'get6', { name: string }, { name: string }>,
        defineAPI<'get6', { name: string }, { name: string }>,
      ]
    >('.', ['get::/->get'])

    expectTypeOf(api.get).toBeFunction()
    expectTypeOf(api.get).parameter(0).toMatchTypeOf<{ name: string }>()

    const serveResponse = {
      success: true,
      data: {
        name: 'Rose',
      },
    }

    return new Promise((resolve) => {
      api
        .get({
          name: 'Jack',
        })({ notificationDelay: true })
        .then(({ backData, result }) => {
          expectTypeOf(backData).toMatchTypeOf<
            | {
              name: string
            }
            | undefined
          >()
          expect(result).toBeTruthy()
          expect(backData).toEqual(serveResponse.data)
        })

      expectTypeOf(api.get).toBeFunction()
      expectTypeOf(api.get).parameter(0).toMatchTypeOf<{ name: string }>()

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: serveResponse,
          })
          .then(() => {
            expect(request.url).toEqual('./?name=Jack')
            expect(request.config.method).toEqual('get')
            expect(request.config.params.name).toEqual('Jack')
            resolve(true)
          })
      })
    })
  })

  it('create empty request is ok', () => {
    const api = http.create<[defineAPI<'get', void, { success: boolean }>]>('.', ['get()::/->get'])
    const serveResponse = {
      success: true,
      data: {
        name: 'wxd',
      },
    }

    expectTypeOf(api.get).toBeFunction()
    expectTypeOf(api.get).parameter(0).toMatchTypeOf<Config | undefined>()

    return new Promise((resolve) => {
      api
        .get({
          timeout: 1000,
        })({ notificationDelay: true })
        .then(({ backData, result }) => {
          expect(result).toBeTruthy()
          expect(backData).toEqual(serveResponse.data)
        })

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: serveResponse,
          })
          .then(() => {
            expect(request.url).toEqual('./')
            expect(request.timeout).toBe(1000)
            expect(request.config.method).toEqual('get')
            expect(request.config.params.name).toBe(undefined)
            resolve(true)
          })
      })
    })
  })

  it('use inputData as params in request is ok', () => {
    const api = http.create<[defineAPI<'del', { code: number }, { success: boolean }>]>('.', ['delete::/del?'])
    const serveResponse = {
      success: true,
      data: {
        name: 'wxd',
      },
    }

    return new Promise((resolve) => {
      api
        .del(
          { code: 22 },
          {
            timeout: 999,
          },
        )({ notificationDelay: true })
        .then(({ backData, result }) => {
          expect(result).toBeTruthy()
          expect(backData).toEqual(serveResponse.data)
        })

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: serveResponse,
          })
          .then(() => {
            expect(request.url).toEqual('./del?code=22')
            expect(request.timeout).toBe(999)
            expect(request.config.method).toEqual('delete')
            expect(request.config.params.name).toBe(undefined)
            resolve(true)
          })
      })
    })
  })

  it('create both params and data request', () => {
    const api = http.create<[defineAPI<'post', [{ code: number }, { name: string }], { success: boolean }>]>('.', [
      'post::/?->post',
    ])
    const serveResponse = {
      success: true,
      data: {
        name: 'wxd',
      },
    }

    return new Promise((resolve) => {
      const requestData = {
        name: 'deleteName',
      }
      api
        .post(
          { code: 22 },
          {
            timeout: 998,
            data: requestData,
          },
        )({ notificationDelay: true })
        .then(({ backData, result }) => {
          expect(result).toBeTruthy()
          expect(backData).toEqual(serveResponse.data)
        })

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: serveResponse,
          })
          .then(() => {
            expect(request.url).toEqual('./?code=22')
            expect(request.config.data).toEqual(JSON.stringify(requestData))
            expect(request.timeout).toBe(998)
            expect(request.config.method).toEqual('post')
            expect(request.config.params).toEqual({
              code: 22,
            })
            resolve(true)
          })
      })
    })
  })

  it('create inject param', () => {
    const api = http.create<[defineAPI<'getByCode', { code: number }, { name: boolean }>]>('.', [
      'get::/{code}/getByCode',
    ])
    const serveResponse = {
      success: true,
      data: {
        name: 'wxd',
      },
    }

    return new Promise((resolve) => {
      api
        .getByCode(
          { code: 22 },
          {
            timeout: 998,
          },
        )({ notificationDelay: true })
        .then(({ backData, result }) => {
          expect(result).toBeTruthy()
          expect(backData).toEqual(serveResponse.data)
        })

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: serveResponse,
          })
          .then(() => {
            expect(request.url).toEqual('./22/getByCode')
            expect(request.timeout).toBe(998)
            expect(request.config.method).toEqual('get')
            resolve(true)
          })
      })
    })
  })

  it('create inject param but can not find alter request name', () => {
    expect(() => http.create('.', ['get::/getByCode/{code}'])).toThrowError(
      new RegExp(WHEN_INJECT_PARAM_NO_ID_ERROR_DES),
    )
  })

  it('create with simple param is ok', () => {
    const api = http.create<[defineAPI<'post', { code: number }, { name: string }>]>('.', [
      'post::/->post::contentType->multipart,timeout->98,responseType->blob,contentType->multipart',
    ])
    const serveResponse = {
      success: true,
      data: {
        name: 'wxd',
      },
    }

    return new Promise((resolve) => {
      const requestData = {
        name: 'deleteName',
      }
      api.post(
        { code: 22 },
        {
          data: requestData,
        },
      )()

      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request
          .respondWith({
            status: 200,
            response: serveResponse,
          })
          .then(() => {
            expect(request.config.timeout).toBe(98)
            expect(request.config.headers?.['Content-Type']).toEqual(ContentTypeEnum.MULTIPART)
            expect(request.config.responseType).toBe('blob')
            resolve(true)
          })
      })
    })
  })

  it('ExtractAPI data is function is ok', () => {
    interface Person {
      name: string
    }
    type API = [
      defineAPI<
        'post',
        <const T extends Person>(
          d: T,
          config?: Config
        ) => DefineResponseResult<T extends { name: 'all' } ? Person[] : Person>
      >,
    ]

    const api = http.create<API>('.', [
      'post::/->post::contentType->multipart,timeout->0,responseType->blob,contentType->multipart',
    ])

    return new Promise((resolve) => {
      api
        .post(
          { name: 'all' },
          {
            data: {},
          },
        )()
        .then(({ backData }) => {
          expectTypeOf(backData).toEqualTypeOf<Person[] | undefined>()
        })

      api
        .post(
          { name: 'jack' },
          {
            data: {},
          },
        )()
        .then(({ backData }) => {
          expectTypeOf(backData).toEqualTypeOf<Person | undefined>()
        })

      moxios.wait(() => {
        moxios.requests
          .mostRecent()
          .respondWith({})
          .then(() => {
            resolve(true)
          })
      })
    })
  })

  it('Blob type is ok', () => {
    type API = [defineAPI<'post', string, Blob>]

    const api = http.create<API>('.', [
      'post::/->post::contentType->multipart,timeout->0,responseType->blob,contentType->multipart',
    ])

    return new Promise((resolve) => {
      api
        .post('/download', {
          data: {},
        })({
          getBackData: (result, res) => (result ? res.data : undefined),
        })
        .then(({ backData }) => {
          expectTypeOf(backData).toEqualTypeOf<Blob | undefined>()
        })

      moxios.wait(() => {
        moxios.requests
          .mostRecent()
          .respondWith({})
          .then(() => {
            resolve(true)
          })
      })
    })
  })
})
