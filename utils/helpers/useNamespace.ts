export const useNamespace = () => {
  const variables = {
    namespace: "sc-echarts",
  };

  /**
   * @param scope 类名
   * @returns 返回空间名-类名
   */
  const getPrefixCls = (scope: string) => {
    return `${variables.namespace}-${scope}`;
  };

  return {
    variables,
    getPrefixCls,
  };
};
