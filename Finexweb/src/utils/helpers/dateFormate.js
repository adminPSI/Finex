export const formatDate = (dataStr) => {
    const date = new Date(dataStr)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear();
    return `${month}/${day}/${year}`
}