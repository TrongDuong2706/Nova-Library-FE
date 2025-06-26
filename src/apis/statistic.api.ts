import http from '../utils/http'

export const getBookStat = () => http.get('/borrowingRecordItem')
