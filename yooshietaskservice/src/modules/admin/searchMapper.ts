export function Search(searchKey, path) {
  const keyword = searchKey.trim().split(' ').filter(Boolean);
  if (keyword.length > 1) {
    return {

      $search: {
        text: {
          query: keyword,
          path: path,

        }
      }
    }
  } else {
    return {

      $search: {

        regex: {
          path: path,
          query: `(.*)${keyword[0]}(.*)`,
          allowAnalyzedField: true,
        }
      }
    }
  }
}




