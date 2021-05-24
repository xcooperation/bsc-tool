export const getColumns = (names) => {
  const columns = names.map(n => {
    return {
      label: n.charAt(0).toUpperCase() + n.slice(1),
      field: n,
      sort: "asc",
      width: 150,
    }
  })

  return columns
}