import type {
  Config,
  DefineResponseResult,
  ExtractAPI,
  Restful,
  defineAPI,
} from '../'

export function test<T extends Restful<any>>(
  http: T,
): ExtractAPI<
  [
    defineAPI<'1', void, any>,
    defineAPI<'2', void, any>,
    defineAPI<'3', void, any[]>,
    defineAPI<'4', Pick<any, 'typeCode'>, { data: any[] }>,
    defineAPI<'5', { typeCode: string }, { data: any[] }>,
    defineAPI<'6', { typeName: string }, { data: any[] }>,
    defineAPI<'7', { customerType: number, uniqueId: number }, any[]>,
    defineAPI<'8', { id: number }>,
    defineAPI<'9', any, any[]>,
    defineAPI<'10', any, any[]>,
    defineAPI<'11', any, any[]>,
    defineAPI<'12', void, any[]>,
    defineAPI<'13', { codeId: number }, any[]>,
    defineAPI<'14', { codeId: number }, any[]>,
    defineAPI<'15', void, any[]>,
    defineAPI<'16', { id: number }, any[]>,
    defineAPI<'17', { id: number }, any[]>,
    defineAPI<'18', { id: number }, any[]>,
    defineAPI<'19', { id: number, floor: number }, any[]>,
    defineAPI<'20', void, any[]>,
    defineAPI<'21', void, any[]>,
    defineAPI<'22', void, any[]>,
    defineAPI<'23', unknown, any[]>,
    defineAPI<'24', void, string>,
    defineAPI<'findUserAll', { isEnable?: number }, any[]>,
    defineAPI<'25', void, any[]>,
    defineAPI<'26', void, any[]>,
    defineAPI<'27', void, any[]>,
    defineAPI<'28', unknown, any[]>,
    defineAPI<'29', any, any[]>,
    defineAPI<'30', any, any[]>,
    defineAPI<'31', any, any>,
    defineAPI<'32', any, any>,
    defineAPI<'33', number[], any[]>,
    defineAPI<'34', any, any[]>,
    defineAPI<'35', any, any[]>,
    defineAPI<'36', any, any[]>,
    defineAPI<
      '37',
      <T>(param?: any, config?: Config<T>) => DefineResponseResult<any>
    >,
  ]
> &
ExtractAPI<
  [
    defineAPI<'38', any, any[]>,
    defineAPI<'39', void, any>,
    defineAPI<'40', void, boolean>,
    defineAPI<'41', { id: number }, any[]>,
    defineAPI<'42', { heatingNum: string }, any>,
    defineAPI<'43', any, any>,
    defineAPI<'44', { id: number }, void>,
    defineAPI<'45', { menuId: string }, any[]>,
    defineAPI<'46', void, any[]>,
    defineAPI<'47', { houseId: number }, any[]>,
    defineAPI<'48', { inhousingId: number }, any[]>,
    defineAPI<'49', { houseHolderId: number }, any[]>,
    defineAPI<'50', { slaveHouseId: string, meterId: string }, any[]>,
  ]
> {
  // 50 Type instantiation is excessively deep and possibly infinite.
  return http.create('', [])
}
