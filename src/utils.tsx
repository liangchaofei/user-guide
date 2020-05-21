// 将dom类数组转成数组
export function getDataVarList(list: any) {
    if (!list) return false;
  
    const listData = [];
  
    for (let i = 0, len = list.length; i < len; i += 1) {
      listData.push(list[i]);
    }
  
    return listData;
  }
  // 获取width 和 height
  export function getWindowInfo() {
    return {
      winW: window.innerWidth,
      winH: window.innerHeight,
    };
  }
  