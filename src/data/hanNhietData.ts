/**
 * @license
 * Dữ liệu Mệnh Lý Hàn Nhiệt & Phong Thủy Tô Dân Phong (Peter So Man-Fong)
 * Tích hợp cho dự án Huyền Học - Cửu Nhị
 */

export * from "./hanNhietEngine";

export interface SolarTermRecord {
  [termName: string]: string;
}

export interface HanNhietResult {
  mingType: "Hàn Mệnh" | "Nhiệt Mệnh" | "Bình Mệnh";
  subType?: string;
  seasonDesc: string;
  elementNeed: string;
  favorableDirections: string[];
  luckyColors: string[];
  unfavorableColors: string[];
  year2027Forecast: string;
  lifeAdvice: string;
  principles: string[];
}

export interface FlyingStarInfo {
  number: number;
  name: string;
  chinese: string;
  element: "Thủy" | "Thổ" | "Mộc" | "Kim" | "Hỏa";
  type: "auspicious" | "inauspicious" | "danger";
  label: string;
  remedy: string;
  fortune: string;
  doorTreatment: string;
}

export interface TaiSuiInfo {
  year: number;
  canChi: string;
  zodiac: string;
  branch: string;
  clash: string; // Xung
  punish: string; // Hình
  harm: string; // Hại
  dest: string; // Phá
}

// Bảng tiết khí 1930 - 2035 trích xuất chính xác
export const SOLAR_TERMS_TABLE: Record<string, Record<string, string>> = {
  "1930": {
    "立春": "1930-02-05",
    "驚蟄": "1930-03-06",
    "立夏": "1930-05-06",
    "立秋": "1930-08-08",
    "立冬": "1930-11-08",
    "清明": "1930-04-06"
  },
  "1931": {
    "立春": "1931-02-05",
    "驚蟄": "1931-03-07",
    "立夏": "1931-05-07",
    "立秋": "1931-08-09",
    "立冬": "1931-11-08",
    "清明": "1931-04-06"
  },
  "1932": {
    "立春": "1932-02-05",
    "驚蟄": "1932-03-06",
    "立夏": "1932-05-06",
    "立秋": "1932-08-08",
    "立冬": "1932-11-08",
    "清明": "1932-04-05"
  },
  "1933": {
    "立春": "1933-02-04",
    "驚蟄": "1933-03-06",
    "立夏": "1933-05-06",
    "立秋": "1933-08-08",
    "立冬": "1933-11-08",
    "清明": "1933-04-05"
  },
  "1934": {
    "立春": "1934-02-05",
    "驚蟄": "1934-03-06",
    "立夏": "1934-05-06",
    "立秋": "1934-08-08",
    "立冬": "1934-11-08",
    "清明": "1934-04-05"
  },
  "1935": {
    "立春": "1935-02-05",
    "驚蟄": "1935-03-07",
    "立夏": "1935-05-06",
    "立秋": "1935-08-08",
    "立冬": "1935-11-08",
    "清明": "1935-04-06"
  },
  "1936": {
    "立春": "1936-02-05",
    "驚蟄": "1936-03-06",
    "立夏": "1936-05-06",
    "立秋": "1936-08-08",
    "立冬": "1936-11-08",
    "清明": "1936-04-05"
  },
  "1937": {
    "立春": "1937-02-04",
    "驚蟄": "1937-03-06",
    "立夏": "1937-05-06",
    "立秋": "1937-08-08",
    "立冬": "1937-11-08",
    "清明": "1937-04-05"
  },
  "1938": {
    "立春": "1938-02-04",
    "驚蟄": "1938-03-06",
    "立夏": "1938-05-06",
    "立秋": "1938-08-08",
    "立冬": "1938-11-08",
    "清明": "1938-04-05"
  },
  "1939": {
    "立春": "1939-02-05",
    "驚蟄": "1939-03-06",
    "立夏": "1939-05-06",
    "立秋": "1939-08-08",
    "立冬": "1939-11-08",
    "清明": "1939-04-06"
  },
  "1940": {
    "立春": "1940-02-05",
    "驚蟄": "1940-03-06",
    "立夏": "1940-05-06",
    "立秋": "1940-08-08",
    "立冬": "1940-11-08",
    "清明": "1940-04-05"
  },
  "1941": {
    "立春": "1941-02-04",
    "驚蟄": "1941-03-06",
    "立夏": "1941-05-06",
    "立秋": "1941-08-08",
    "立冬": "1941-11-08",
    "清明": "1941-04-05"
  },
  "1942": {
    "立春": "1942-02-04",
    "驚蟄": "1942-03-06",
    "立夏": "1942-05-06",
    "立秋": "1942-08-08",
    "立冬": "1942-11-08",
    "清明": "1942-04-05"
  },
  "1943": {
    "立春": "1943-02-05",
    "驚蟄": "1943-03-06",
    "立夏": "1943-05-06",
    "立秋": "1943-08-08",
    "立冬": "1943-11-08",
    "清明": "1943-04-06"
  },
  "1944": {
    "立春": "1944-02-05",
    "驚蟄": "1944-03-06",
    "立夏": "1944-05-06",
    "立秋": "1944-08-08",
    "立冬": "1944-11-08",
    "清明": "1944-04-05"
  },
  "1945": {
    "立春": "1945-02-04",
    "驚蟄": "1945-03-06",
    "立夏": "1945-05-06",
    "立秋": "1945-08-08",
    "立冬": "1945-11-08",
    "清明": "1945-04-05"
  },
  "1946": {
    "立春": "1946-02-04",
    "驚蟄": "1946-03-06",
    "立夏": "1946-05-06",
    "立秋": "1946-08-08",
    "立冬": "1946-11-08",
    "清明": "1946-04-05"
  },
  "1947": {
    "立春": "1947-02-05",
    "驚蟄": "1947-03-06",
    "立夏": "1947-05-06",
    "立秋": "1947-08-08",
    "立冬": "1947-11-08",
    "清明": "1947-04-06"
  },
  "1948": {
    "立春": "1948-02-05",
    "驚蟄": "1948-03-06",
    "立夏": "1948-05-06",
    "立秋": "1948-08-08",
    "立冬": "1948-11-08",
    "清明": "1948-04-05"
  },
  "1949": {
    "立春": "1949-02-04",
    "驚蟄": "1949-03-06",
    "立夏": "1949-05-06",
    "立秋": "1949-08-08",
    "立冬": "1949-11-08",
    "清明": "1949-04-05"
  },
  "1950": {
    "立春": "1950-02-04",
    "驚蟄": "1950-03-06",
    "立夏": "1950-05-06",
    "立秋": "1950-08-08",
    "立冬": "1950-11-08",
    "清明": "1950-04-05"
  },
  "1951": {
    "立春": "1951-02-05",
    "驚蟄": "1951-03-06",
    "立夏": "1951-05-06",
    "立秋": "1951-08-08",
    "立冬": "1951-11-08",
    "清明": "1951-04-06"
  },
  "1952": {
    "立春": "1952-02-05",
    "驚蟄": "1952-03-06",
    "立夏": "1952-05-06",
    "立秋": "1952-08-08",
    "立冬": "1952-11-07",
    "清明": "1952-04-05"
  },
  "1953": {
    "立春": "1953-02-04",
    "驚蟄": "1953-03-06",
    "立夏": "1953-05-06",
    "立秋": "1953-08-08",
    "立冬": "1953-11-08",
    "清明": "1953-04-05"
  },
  "1954": {
    "立春": "1954-02-04",
    "驚蟄": "1954-03-06",
    "立夏": "1954-05-06",
    "立秋": "1954-08-08",
    "立冬": "1954-11-08",
    "清明": "1954-04-05"
  },
  "1955": {
    "立春": "1955-02-05",
    "驚蟄": "1955-03-06",
    "立夏": "1955-05-06",
    "立秋": "1955-08-08",
    "立冬": "1955-11-08",
    "清明": "1955-04-06"
  },
  "1956": {
    "立春": "1956-02-05",
    "驚蟄": "1956-03-06",
    "立夏": "1956-05-06",
    "立秋": "1956-08-08",
    "立冬": "1956-11-07",
    "清明": "1956-04-05"
  },
  "1957": {
    "立春": "1957-02-04",
    "驚蟄": "1957-03-06",
    "立夏": "1957-05-06",
    "立秋": "1957-08-08",
    "立冬": "1957-11-08",
    "清明": "1957-04-05"
  },
  "1958": {
    "立春": "1958-02-04",
    "驚蟄": "1958-03-06",
    "立夏": "1958-05-06",
    "立秋": "1958-08-08",
    "立冬": "1958-11-08",
    "清明": "1958-04-05"
  },
  "1959": {
    "立春": "1959-02-05",
    "驚蟄": "1959-03-06",
    "立夏": "1959-05-06",
    "立秋": "1959-08-08",
    "立冬": "1959-11-08",
    "清明": "1959-04-06"
  },
  "1960": {
    "立春": "1960-02-05",
    "驚蟄": "1960-03-06",
    "立夏": "1960-05-06",
    "立秋": "1960-08-08",
    "立冬": "1960-11-07",
    "清明": "1960-04-05"
  },
  "1961": {
    "立春": "1961-02-04",
    "驚蟄": "1961-03-06",
    "立夏": "1961-05-06",
    "立秋": "1961-08-08",
    "立冬": "1961-11-08",
    "清明": "1961-04-05"
  },
  "1962": {
    "立春": "1962-02-04",
    "驚蟄": "1962-03-06",
    "立夏": "1962-05-06",
    "立秋": "1962-08-08",
    "立冬": "1962-11-08",
    "清明": "1962-04-05"
  },
  "1963": {
    "立春": "1963-02-05",
    "驚蟄": "1963-03-06",
    "立夏": "1963-05-06",
    "立秋": "1963-08-08",
    "立冬": "1963-11-08",
    "清明": "1963-04-06"
  },
  "1964": {
    "立春": "1964-02-05",
    "驚蟄": "1964-03-06",
    "立夏": "1964-05-05",
    "立秋": "1964-08-08",
    "立冬": "1964-11-07",
    "清明": "1964-04-05"
  },
  "1965": {
    "立春": "1965-02-04",
    "驚蟄": "1965-03-06",
    "立夏": "1965-05-06",
    "立秋": "1965-08-08",
    "立冬": "1965-11-08",
    "清明": "1965-04-05"
  },
  "1966": {
    "立春": "1966-02-04",
    "驚蟄": "1966-03-06",
    "立夏": "1966-05-06",
    "立秋": "1966-08-08",
    "立冬": "1966-11-08",
    "清明": "1966-04-05"
  },
  "1967": {
    "立春": "1967-02-05",
    "驚蟄": "1967-03-06",
    "立夏": "1967-05-06",
    "立秋": "1967-08-08",
    "立冬": "1967-11-08",
    "清明": "1967-04-05"
  },
  "1968": {
    "立春": "1968-02-05",
    "驚蟄": "1968-03-06",
    "立夏": "1968-05-05",
    "立秋": "1968-08-07",
    "立冬": "1968-11-07",
    "清明": "1968-04-05"
  },
  "1969": {
    "立春": "1969-02-04",
    "驚蟄": "1969-03-06",
    "立夏": "1969-05-06",
    "立秋": "1969-08-08",
    "立冬": "1969-11-08",
    "清明": "1969-04-05"
  },
  "1970": {
    "立春": "1970-02-04",
    "驚蟄": "1970-03-06",
    "立夏": "1970-05-06",
    "立秋": "1970-08-08",
    "立冬": "1970-11-08",
    "清明": "1970-04-05"
  },
  "1971": {
    "立春": "1971-02-04",
    "驚蟄": "1971-03-06",
    "立夏": "1971-05-06",
    "立秋": "1971-08-08",
    "立冬": "1971-11-08",
    "清明": "1971-04-05"
  },
  "1972": {
    "立春": "1972-02-05",
    "驚蟄": "1972-03-05",
    "立夏": "1972-05-05",
    "立秋": "1972-08-07",
    "立冬": "1972-11-07",
    "清明": "1972-04-05"
  },
  "1973": {
    "立春": "1973-02-04",
    "驚蟄": "1973-03-06",
    "立夏": "1973-05-06",
    "立秋": "1973-08-08",
    "立冬": "1973-11-08",
    "清明": "1973-04-05"
  },
  "1974": {
    "立春": "1974-02-04",
    "驚蟄": "1974-03-06",
    "立夏": "1974-05-06",
    "立秋": "1974-08-08",
    "立冬": "1974-11-08",
    "清明": "1974-04-05"
  },
  "1975": {
    "立春": "1975-02-04",
    "驚蟄": "1975-03-06",
    "立夏": "1975-05-06",
    "立秋": "1975-08-08",
    "立冬": "1975-11-08",
    "清明": "1975-04-05"
  },
  "1976": {
    "立春": "1976-02-05",
    "驚蟄": "1976-03-05",
    "立夏": "1976-05-05",
    "立秋": "1976-08-07",
    "立冬": "1976-11-07",
    "清明": "1976-04-05"
  },
  "1977": {
    "立春": "1977-02-04",
    "驚蟄": "1977-03-06",
    "立夏": "1977-05-06",
    "立秋": "1977-08-08",
    "立冬": "1977-11-08",
    "清明": "1977-04-05"
  },
  "1978": {
    "立春": "1978-02-04",
    "驚蟄": "1978-03-06",
    "立夏": "1978-05-06",
    "立秋": "1978-08-08",
    "立冬": "1978-11-08",
    "清明": "1978-04-05"
  },
  "1979": {
    "立春": "1979-02-04",
    "驚蟄": "1979-03-06",
    "立夏": "1979-05-06",
    "立秋": "1979-08-08",
    "立冬": "1979-11-08",
    "清明": "1979-04-05"
  },
  "1980": {
    "立春": "1980-02-05",
    "驚蟄": "1980-03-05",
    "立夏": "1980-05-05",
    "立秋": "1980-08-07",
    "立冬": "1980-11-07",
    "清明": "1980-04-05"
  },
  "1981": {
    "立春": "1981-02-04",
    "驚蟄": "1981-03-06",
    "立夏": "1981-05-06",
    "立秋": "1981-08-08",
    "立冬": "1981-11-08",
    "清明": "1981-04-05"
  },
  "1982": {
    "立春": "1982-02-04",
    "驚蟄": "1982-03-06",
    "立夏": "1982-05-06",
    "立秋": "1982-08-08",
    "立冬": "1982-11-08",
    "清明": "1982-04-05"
  },
  "1983": {
    "立春": "1983-02-04",
    "驚蟄": "1983-03-06",
    "立夏": "1983-05-06",
    "立秋": "1983-08-08",
    "立冬": "1983-11-08",
    "清明": "1983-04-05"
  },
  "1984": {
    "立春": "1984-02-05",
    "驚蟄": "1984-03-05",
    "立夏": "1984-05-05",
    "立秋": "1984-08-07",
    "立冬": "1984-11-07",
    "清明": "1984-04-05"
  },
  "1985": {
    "立春": "1985-02-04",
    "驚蟄": "1985-03-06",
    "立夏": "1985-05-06",
    "立秋": "1985-08-08",
    "立冬": "1985-11-07",
    "清明": "1985-04-05"
  },
  "1986": {
    "立春": "1986-02-04",
    "驚蟄": "1986-03-06",
    "立夏": "1986-05-06",
    "立秋": "1986-08-08",
    "立冬": "1986-11-08",
    "清明": "1986-04-05"
  },
  "1987": {
    "立春": "1987-02-04",
    "驚蟄": "1987-03-06",
    "立夏": "1987-05-06",
    "立秋": "1987-08-08",
    "立冬": "1987-11-08",
    "清明": "1987-04-05"
  },
  "1988": {
    "立春": "1988-02-05",
    "驚蟄": "1988-03-05",
    "立夏": "1988-05-05",
    "立秋": "1988-08-07",
    "立冬": "1988-11-07",
    "清明": "1988-04-05"
  },
  "1989": {
    "立春": "1989-02-04",
    "驚蟄": "1989-03-06",
    "立夏": "1989-05-06",
    "立秋": "1989-08-08",
    "立冬": "1989-11-07",
    "清明": "1989-04-05"
  },
  "1990": {
    "立春": "1990-02-04",
    "驚蟄": "1990-03-06",
    "立夏": "1990-05-06",
    "立秋": "1990-08-08",
    "立冬": "1990-11-08",
    "清明": "1990-04-05"
  },
  "1991": {
    "立春": "1991-02-04",
    "驚蟄": "1991-03-06",
    "立夏": "1991-05-06",
    "立秋": "1991-08-08",
    "立冬": "1991-11-08",
    "清明": "1991-04-05"
  },
  "1992": {
    "立春": "1992-02-05",
    "驚蟄": "1992-03-05",
    "立夏": "1992-05-05",
    "立秋": "1992-08-07",
    "立冬": "1992-11-07",
    "清明": "1992-04-05"
  },
  "1993": {
    "立春": "1993-02-04",
    "驚蟄": "1993-03-06",
    "立夏": "1993-05-06",
    "立秋": "1993-08-08",
    "立冬": "1993-11-07",
    "清明": "1993-04-05"
  },
  "1994": {
    "立春": "1994-02-04",
    "驚蟄": "1994-03-06",
    "立夏": "1994-05-06",
    "立秋": "1994-08-08",
    "立冬": "1994-11-08",
    "清明": "1994-04-05"
  },
  "1995": {
    "立春": "1995-02-04",
    "驚蟄": "1995-03-06",
    "立夏": "1995-05-06",
    "立秋": "1995-08-08",
    "立冬": "1995-11-08",
    "清明": "1995-04-05"
  },
  "1996": {
    "立春": "1996-02-05",
    "驚蟄": "1996-03-05",
    "立夏": "1996-05-05",
    "立秋": "1996-08-07",
    "立冬": "1996-11-07",
    "清明": "1996-04-05"
  },
  "1997": {
    "立春": "1997-02-04",
    "驚蟄": "1997-03-06",
    "立夏": "1997-05-05",
    "立秋": "1997-08-07",
    "立冬": "1997-11-07",
    "清明": "1997-04-05"
  },
  "1998": {
    "立春": "1998-02-04",
    "驚蟄": "1998-03-06",
    "立夏": "1998-05-06",
    "立秋": "1998-08-08",
    "立冬": "1998-11-08",
    "清明": "1998-04-05"
  },
  "1999": {
    "立春": "1999-02-04",
    "驚蟄": "1999-03-06",
    "立夏": "1999-05-06",
    "立秋": "1999-08-08",
    "立冬": "1999-11-08",
    "清明": "1999-04-05"
  },
  "2000": {
    "立春": "2000-02-05",
    "驚蟄": "2000-03-05",
    "立夏": "2000-05-05",
    "立秋": "2000-08-07",
    "立冬": "2000-11-07",
    "清明": "2000-04-04"
  },
  "2001": {
    "立春": "2001-02-04",
    "驚蟄": "2001-03-06",
    "立夏": "2001-05-05",
    "立秋": "2001-08-07",
    "立冬": "2001-11-07",
    "清明": "2001-04-05"
  },
  "2002": {
    "立春": "2002-02-04",
    "驚蟄": "2002-03-06",
    "立夏": "2002-05-06",
    "立秋": "2002-08-08",
    "立冬": "2002-11-08",
    "清明": "2002-04-05"
  },
  "2003": {
    "立春": "2003-02-04",
    "驚蟄": "2003-03-06",
    "立夏": "2003-05-06",
    "立秋": "2003-08-08",
    "立冬": "2003-11-08",
    "清明": "2003-04-05"
  },
  "2004": {
    "立春": "2004-02-04",
    "驚蟄": "2004-03-05",
    "立夏": "2004-05-05",
    "立秋": "2004-08-07",
    "立冬": "2004-11-07",
    "清明": "2004-04-04"
  },
  "2005": {
    "立春": "2005-02-04",
    "驚蟄": "2005-03-05",
    "立夏": "2005-05-05",
    "立秋": "2005-08-07",
    "立冬": "2005-11-07",
    "清明": "2005-04-05"
  },
  "2006": {
    "立春": "2006-02-04",
    "驚蟄": "2006-03-06",
    "立夏": "2006-05-06",
    "立秋": "2006-08-08",
    "立冬": "2006-11-08",
    "清明": "2006-04-05"
  },
  "2007": {
    "立春": "2007-02-04",
    "驚蟄": "2007-03-06",
    "立夏": "2007-05-06",
    "立秋": "2007-08-08",
    "立冬": "2007-11-08",
    "清明": "2007-04-05"
  },
  "2008": {
    "立春": "2008-02-04",
    "驚蟄": "2008-03-05",
    "立夏": "2008-05-05",
    "立秋": "2008-08-07",
    "立冬": "2008-11-07",
    "清明": "2008-04-04"
  },
  "2009": {
    "立春": "2009-02-04",
    "驚蟄": "2009-03-05",
    "立夏": "2009-05-05",
    "立秋": "2009-08-07",
    "立冬": "2009-11-07",
    "清明": "2009-04-05"
  },
  "2010": {
    "立春": "2010-02-04",
    "驚蟄": "2010-03-06",
    "立夏": "2010-05-06",
    "立秋": "2010-08-08",
    "立冬": "2010-11-08",
    "清明": "2010-04-05"
  },
  "2011": {
    "立春": "2011-02-04",
    "驚蟄": "2011-03-06",
    "立夏": "2011-05-06",
    "立秋": "2011-08-08",
    "立冬": "2011-11-08",
    "清明": "2011-04-05"
  },
  "2012": {
    "立春": "2012-02-04",
    "驚蟄": "2012-03-05",
    "立夏": "2012-05-05",
    "立秋": "2012-08-07",
    "立冬": "2012-11-07",
    "清明": "2012-04-04"
  },
  "2013": {
    "立春": "2013-02-04",
    "驚蟄": "2013-03-05",
    "立夏": "2013-05-05",
    "立秋": "2013-08-07",
    "立冬": "2013-11-07",
    "清明": "2013-04-05"
  },
  "2014": {
    "立春": "2014-02-04",
    "驚蟄": "2014-03-06",
    "立夏": "2014-05-06",
    "立秋": "2014-08-08",
    "立冬": "2014-11-08",
    "清明": "2014-04-05"
  },
  "2015": {
    "立春": "2015-02-04",
    "驚蟄": "2015-03-06",
    "立夏": "2015-05-06",
    "立秋": "2015-08-08",
    "立冬": "2015-11-08",
    "清明": "2015-04-05"
  },
  "2016": {
    "立春": "2016-02-04",
    "驚蟄": "2016-03-05",
    "立夏": "2016-05-05",
    "立秋": "2016-08-07",
    "立冬": "2016-11-07",
    "清明": "2016-04-04"
  },
  "2017": {
    "立春": "2017-02-04",
    "驚蟄": "2017-03-05",
    "立夏": "2017-05-05",
    "立秋": "2017-08-07",
    "立冬": "2017-11-07",
    "清明": "2017-04-05"
  },
  "2018": {
    "立春": "2018-02-04",
    "驚蟄": "2018-03-06",
    "立夏": "2018-05-06",
    "立秋": "2018-08-08",
    "立冬": "2018-11-07",
    "清明": "2018-04-05"
  },
  "2019": {
    "立春": "2019-02-04",
    "驚蟄": "2019-03-06",
    "立夏": "2019-05-06",
    "立秋": "2019-08-08",
    "立冬": "2019-11-08",
    "清明": "2019-04-05"
  },
  "2020": {
    "立春": "2020-02-04",
    "驚蟄": "2020-03-05",
    "立夏": "2020-05-05",
    "立秋": "2020-08-07",
    "立冬": "2020-11-07",
    "清明": "2020-04-04"
  },
  "2021": {
    "立春": "2021-02-04",
    "驚蟄": "2021-03-05",
    "立夏": "2021-05-05",
    "立秋": "2021-08-07",
    "立冬": "2021-11-07",
    "清明": "2021-04-05"
  },
  "2022": {
    "立春": "2022-02-04",
    "驚蟄": "2022-03-06",
    "立夏": "2022-05-06",
    "立秋": "2022-08-08",
    "立冬": "2022-11-07",
    "清明": "2022-04-05"
  },
  "2023": {
    "立春": "2023-02-04",
    "驚蟄": "2023-03-06",
    "立夏": "2023-05-06",
    "立秋": "2023-08-08",
    "立冬": "2023-11-08",
    "清明": "2023-04-05"
  },
  "2024": {
    "立春": "2024-02-04",
    "驚蟄": "2024-03-05",
    "立夏": "2024-05-05",
    "立秋": "2024-08-07",
    "立冬": "2024-11-07",
    "清明": "2024-04-04"
  },
  "2025": {
    "立春": "2025-02-04",
    "驚蟄": "2025-03-05",
    "立夏": "2025-05-05",
    "立秋": "2025-08-07",
    "立冬": "2025-11-07",
    "清明": "2025-04-05"
  },
  "2026": {
    "立春": "2026-02-04",
    "驚蟄": "2026-03-06",
    "立夏": "2026-05-05",
    "立秋": "2026-08-07",
    "立冬": "2026-11-07",
    "清明": "2026-04-05"
  },
  "2027": {
    "立春": "2027-02-04",
    "驚蟄": "2027-03-06",
    "立夏": "2027-05-06",
    "立秋": "2027-08-08",
    "立冬": "2027-11-08",
    "清明": "2027-04-05"
  },
  "2028": {
    "立春": "2028-02-04",
    "驚蟄": "2028-03-05",
    "立夏": "2028-05-05",
    "立秋": "2028-08-07",
    "立冬": "2028-11-07",
    "清明": "2028-04-04"
  },
  "2029": {
    "立春": "2029-02-04",
    "驚蟄": "2029-03-05",
    "立夏": "2029-05-05",
    "立秋": "2029-08-07",
    "立冬": "2029-11-07",
    "清明": "2029-04-04"
  },
  "2030": {
    "立春": "2030-02-04",
    "驚蟄": "2030-03-06",
    "立夏": "2030-05-05",
    "立秋": "2030-08-07",
    "立冬": "2030-11-07",
    "清明": "2030-04-05"
  },
  "2031": {
    "立春": "2031-02-04",
    "驚蟄": "2031-03-06",
    "立夏": "2031-05-06",
    "立秋": "2031-08-08",
    "立冬": "2031-11-08",
    "清明": "2031-04-05"
  },
  "2032": {
    "立春": "2032-02-04",
    "驚蟄": "2032-03-05",
    "立夏": "2032-05-05",
    "立秋": "2032-08-07",
    "立冬": "2032-11-07",
    "清明": "2032-04-04"
  },
  "2033": {
    "立春": "2033-02-04",
    "驚蟄": "2033-03-05",
    "立夏": "2033-05-05",
    "立秋": "2033-08-07",
    "立冬": "2033-11-07",
    "清明": "2033-04-04"
  },
  "2034": {
    "立春": "2034-02-04",
    "驚蟄": "2034-03-06",
    "立夏": "2034-05-05",
    "立秋": "2034-08-07",
    "立冬": "2034-11-07",
    "清明": "2034-04-05"
  },
  "2035": {
    "立春": "2035-02-04",
    "驚蟄": "2035-03-06",
    "立夏": "2035-05-06",
    "立秋": "2035-08-08",
    "立冬": "2035-11-08",
    "清明": "2035-04-05"
  }
};

// 9 sao Phi Tinh theo trường phái chuẩn của Sư Phụ Tô Dân Phong
export const FLYING_STARS_DATA: Record<number, FlyingStarInfo> = {
  1: {
    number: 1,
    name: "Nhất Bạch Tham Lang",
    chinese: "一白貪狼",
    element: "Thủy",
    type: "auspicious",
    label: "Đào Hoa Quý Nhân",
    remedy: "Nên đặt hộp nhạc kim loại và một chén nước sạch để kích hoạt đào hoa nhân duyên",
    fortune: "Năm đào hoa nhân duyên vượng phát, cực kỳ có lợi cho việc mở rộng quan hệ xã giao, người độc thân có cơ hội tìm thấy ý trung nhân.",
    doorTreatment: "Kích đào hoa: Đặt thảm màu hồng bên ngoài cửa (tục lệ); Để vượng tài Thủy: Đặt thảm xám hoặc xanh lam bên trong cửa. Đã kết hôn muốn tránh đào hoa sát: Đặt thảm xám/lam trong cửa."
  },
  2: {
    number: 2,
    name: "Nhị Hắc Cự Môn",
    chinese: "二黑巨門",
    element: "Thổ",
    type: "danger",
    label: "Bệnh Phù Nhỏ",
    remedy: "Nên đặt hộp nhạc bằng đồng hoặc vật phẩm kim loại phát âm thanh để hóa giải bệnh khí (Kim tiết Thổ)",
    fortune: "Bệnh Phù tinh đương lệnh, đặc biệt lưu ý bệnh đường ruột, dạ dày và phụ khoa. Phương vị này tối kỵ động thổ, nên giữ yên tĩnh.",
    doorTreatment: "Cửa trong đặt thảm màu xám, bên dưới thảm lót đồng xu hoặc miếng kim loại (Kim tiết Thổ) để hóa giải sao bệnh."
  },
  3: {
    number: 3,
    name: "Tam Bích Lộc Tồn",
    chinese: "三碧祿存",
    element: "Mộc",
    type: "inauspicious",
    label: "Thị Phi Tranh Chấp",
    remedy: "Nên đặt đồ vật màu hồng hoặc đỏ để tiết bớt mộc khí hung hãn (Hỏa tiết Mộc)",
    fortune: "Năm dễ vướng vào khẩu thiệt, thị phi kiện tụng, kỵ kích động tranh cãi, dĩ hòa vi quý, thận trọng lời ăn tiếng nói.",
    doorTreatment: "Trong hoặc ngoài cửa đặt thảm màu hồng hoặc đỏ (Hỏa tiết Mộc) để hóa giải khẩu thiệt thị phi."
  },
  4: {
    number: 4,
    name: "Tứ Lục Văn Khúc",
    chinese: "四綠文曲",
    element: "Mộc",
    type: "auspicious",
    label: "Văn Xương Học Vấn",
    remedy: "Nên đặt 4 cành trúc phú quý hoặc một chén nước để kích vượng văn tinh",
    fortune: "Văn Xương đương vượng, đại lợi cho việc học hành, thi cử, ký kết văn bản hợp đồng, đầu óc sáng suốt dễ lập công danh.",
    doorTreatment: "Trong cửa đặt thảm xám, đồng thời trong hoặc ngoài cửa đặt miếng vải xanh lá hoặc một chén nước để kích hoạt Văn Xương."
  },
  5: {
    number: 5,
    name: "Ngũ Hoàng Liêm Trinh",
    chinese: "五黃廉貞",
    element: "Thổ",
    type: "danger",
    label: "Đại Tai Bệnh Phù (Hung Nhất)",
    remedy: "Nên đặt hộp nhạc bằng đồng và một chén nước sạch, treo chuông gió kim loại để hóa Ngũ Hoàng Sát",
    fortune: "Tai họa tật bệnh tiềm ẩn, phương vị này ĐẠI KỴ động thổ đập phá sửa chữa. Lấy hóa sát làm đầu, hành sự khiêm tốn.",
    doorTreatment: "Trong cửa đặt thảm xám lót miếng kim loại bên dưới + treo chuông gió kim loại + đặt hộp nhạc bên cạnh cửa (Kim tiết Thổ độc)."
  },
  6: {
    number: 6,
    name: "Lục Bạch Vũ Khúc",
    chinese: "六白武曲",
    element: "Kim",
    type: "auspicious",
    label: "Vũ Khúc Thiên Tài (Thăng Quan)",
    remedy: "Nên đặt một chén nước sạch để kích tài hoặc 8 viên đá trắng để thăng tiến địa vị",
    fortune: "Thiên tài và quý nhân quyền thế tương trợ, có lợi cho việc cầu thăng chức, nâng cao vị thế và thu nhập bất ngờ.",
    doorTreatment: "Ngoài cửa đặt thảm màu vàng hoặc nâu cà phê (Thổ sinh Kim), trong cửa đặt thảm màu xám, lợi cho chức vụ và tài vận."
  },
  7: {
    number: 7,
    name: "Thất Xích Phá Quân",
    chinese: "七赤破軍",
    element: "Kim",
    type: "inauspicious",
    label: "Phá Quân Hao Tài",
    remedy: "Nên đặt một chén nước sạch để tiết khí Phá Quân (Kim sinh Thủy tiết); KỴ đặt hộp nhạc/kim loại khiến hung khí tăng",
    fortune: "Sao chủ hao tài tốn của, đề phòng bị trộm cắp, lừa đảo; quản lý tài chính nên bảo thủ, không mạo hiểm đầu cơ.",
    doorTreatment: "Bên cạnh hoặc bên trong cửa đặt một chén nước sạch để tiết kim sát (có thể dùng thảm xám/lam thuộc Thủy; KỴ thảm trắng/vàng kim)."
  },
  8: {
    number: 8,
    name: "Bát Bạch Tả Phụ",
    chinese: "八白左輔",
    element: "Thổ",
    type: "auspicious",
    label: "Chính Tài Tinh Đắc Lệnh",
    remedy: "Nên đặt một chén nước sạch hoặc phong thủy luân để kích vượng tài tinh",
    fortune: "Sao tài tinh đại cát, rất có lợi cho việc mua bán bất động sản, tích lũy tiền bạc và đầu tư, tài vận hanh thông nhất năm.",
    doorTreatment: "Ngoài cửa đặt thảm màu đỏ rực rỡ (Hỏa sinh Thổ) để chiêu tài đón lộc vào nhà."
  },
  9: {
    number: 9,
    name: "Cửu Tử Hữu Bật",
    chinese: "九紫右弼",
    element: "Hỏa",
    type: "auspicious",
    label: "Hỷ Khánh Đương Lệnh (Vận 9)",
    remedy: "Nên đặt 4 chậu cây xanh và 9 cành hoa đỏ để kích hoạt hỷ khí may mắn",
    fortune: "Sao chủ hỷ khánh đào hoa, rất lợi cho việc hôn nhân, sinh con thêm đinh, gia môn có chuyện vui mừng, nhân duyên thịnh vượng.",
    doorTreatment: "Ngoài cửa đặt thảm màu xanh lá cây (Mộc sinh Hỏa) để kích phát hỷ khí ngập tràn."
  }
};

export const LUOSHU_TEMPLATE = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6]
];

export const COMPASS_DIRECTIONS = [
  ["Đông Nam (SE)", "Nam (S)", "Tây Nam (SW)"],
  ["Đông (E)", "Trung Cung", "Tây (W)"],
  ["Đông Bắc (NE)", "Bắc (N)", "Tây Bắc (NW)"]
];

export const DIRECTIONS_8 = [
  "Đông Nam", "Nam", "Tây Nam", "Đông", "Trung Cung", "Tây", "Đông Bắc", "Bắc", "Tây Bắc"
];

// Tính sao nhập trung cung theo năm
export function getCenterStar(year: number): number {
  let c = 3 - ((year - 2024) % 9);
  while (c <= 0) c += 9;
  return c;
}

// Tính ma trận 9 cung phi tinh
export function getFlyingStarGrid(centerStar: number): number[][] {
  return LUOSHU_TEMPLATE.map(row =>
    row.map(v => ((((v + centerStar - 6) % 9) + 9) % 9) + 1)
  );
}

// Bảng dữ liệu Thái Tuế 2024 - 2030
export const TAISUI_RULES: Record<number, TaiSuiInfo> = {
  2024: { year: 2024, canChi: "Giáp Thìn", zodiac: "Thìn (Rồng)", branch: "Thìn", clash: "Tuất", punish: "Thìn (Tự hình)", harm: "Mão", dest: "Sửu" },
  2025: { year: 2025, canChi: "Ất Tỵ", zodiac: "Tỵ (Rắn)", branch: "Tỵ", clash: "Hợi", punish: "Thân", harm: "Dần", dest: "Thân" },
  2026: { year: 2026, canChi: "Bính Ngọ", zodiac: "Ngọ (Ngựa)", branch: "Ngọ", clash: "Tý", punish: "Ngọ (Tự hình)", harm: "Sửu", dest: "Mão" },
  2027: { year: 2027, canChi: "Đinh Mùi", zodiac: "Mùi (Dê)", branch: "Mùi", clash: "Sửu", punish: "Tuất", harm: "Tý", dest: "Tuất" },
  2028: { year: 2028, canChi: "Mậu Thân", zodiac: "Thân (Khỉ)", branch: "Thân", clash: "Dần", punish: "Tỵ", harm: "Hợi", dest: "Tỵ" },
  2029: { year: 2029, canChi: "Kỷ Dậu", zodiac: "Dậu (Gà)", branch: "Dậu", clash: "Mão", punish: "Dậu (Tự hình)", harm: "Tuất", dest: "Tý" },
  2030: { year: 2030, canChi: "Canh Tuất", zodiac: "Tuất (Chó)", branch: "Tuất", clash: "Thìn", punish: "Sửu", harm: "Dậu", dest: "Mùi" }
};

export const ZODIAC_LIST = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
export const LIUHE_MAP: Record<string, string> = {
  "Tý": "Sửu", "Sửu": "Tý", "Dần": "Hợi", "Mão": "Tuất", "Thìn": "Dậu", "Tỵ": "Thân",
  "Ngọ": "Mùi", "Mùi": "Ngọ", "Thân": "Tỵ", "Dậu": "Thìn", "Tuất": "Mão", "Hợi": "Dần"
};

export const SANHE_MAP: Record<string, [string, string]> = {
  "Tý": ["Thân", "Thìn"], "Sửu": ["Tỵ", "Dậu"], "Dần": ["Ngọ", "Tuất"], "Mão": ["Hợi", "Mùi"],
  "Thìn": ["Thân", "Tý"], "Tỵ": ["Dậu", "Sửu"], "Ngọ": ["Dần", "Tuất"], "Mùi": ["Mão", "Hợi"],
  "Thân": ["Thìn", "Tý"], "Dậu": ["Tỵ", "Sửu"], "Tuất": ["Dần", "Ngọ"], "Hợi": ["Mão", "Mùi"]
};

// Hàm tính toán Hàn - Nhiệt - Bình Mệnh độc môn Tô Dân Phong
export function calculateHanNhietMenh(birthDateStr: string): HanNhietResult | null {
  if (!birthDateStr) return null;
  const parts = birthDateStr.split("-").map(Number);
  if (parts.length < 3) return null;
  const [year, month, day] = parts;
  const yearStr = String(year);
  const terms = SOLAR_TERMS_TABLE[yearStr];

  if (!terms) {
    return null;
  }

  const lapThu = terms["立秋"] || `${year}-08-08`;
  const lapHa = terms["立夏"] || `${year}-05-06`;
  const kinhTrap = terms["驚蟄"] || `${year}-03-06`;
  const thanhMinh = terms["清明"] || `${year}-04-05`;

  let mingType: "Hàn Mệnh" | "Nhiệt Mệnh" | "Bình Mệnh";
  let subType = "";
  let seasonDesc = "";

  // Quy chuẩn độc môn Tô Dân Phong:
  // Hàn Mệnh: Sau Lập Thu (khoảng 8/8) đến trước Kinh Trập (khoảng 6/3) năm sau (Mùa Thu, Đông, đầu Xuân)
  // Nhiệt Mệnh: Sau Lập Hạ (khoảng 6/5) đến trước Lập Thu (khoảng 8/8) (Mùa Hè)
  // Bình Mệnh: Sau Kinh Trập (khoảng 6/3) đến trước Lập Hạ (khoảng 6/5) (Mùa Xuân: trước Thanh Minh thiên bình, sau Thanh Minh thiên nhiệt)
  if (birthDateStr >= lapThu || birthDateStr < kinhTrap) {
    mingType = "Hàn Mệnh";
    subType = "Hàn Mệnh Nhân (Mùa Thu • Mùa Đông • Đầu Xuân)";
    seasonDesc = "Sinh vào khoảng thời gian từ sau Lập Thu (khoảng 8/8) đến trước Tiết Kinh Trập (khoảng 6/3) năm sau. Đây là khoảng thời gian dài nhất trong năm, thiên địa khí hàn bao phủ.";
  } else if (birthDateStr >= lapHa && birthDateStr < lapThu) {
    mingType = "Nhiệt Mệnh";
    subType = "Nhiệt Mệnh Nhân (Mùa Hè Khí Nóng)";
    seasonDesc = "Sinh vào khoảng thời gian từ sau Lập Hạ (khoảng 6/5) đến trước Tiết Lập Thu (khoảng 8/8). Thời tiết mùa hè hỏa khí bốc cao, dương thịnh âm suy.";
  } else if (birthDateStr >= thanhMinh) {
    mingType = "Bình Mệnh";
    subType = "Bình Mệnh Nhân (Thiên Nhiệt • Sau Thanh Minh)";
    seasonDesc = "Sinh vào khoảng từ sau Tiết Thanh Minh (khoảng 5/4) đến trước Tiết Lập Hạ (khoảng 6/5). Khí xuân dần ấm, thiên về tính nhiệt nhẹ.";
  } else {
    mingType = "Bình Mệnh";
    subType = "Bình Mệnh Nhân (Thiên Bình • Trước Thanh Minh)";
    seasonDesc = "Sinh vào khoảng từ sau Tiết Kinh Trập (khoảng 6/3) đến trước Tiết Thanh Minh (khoảng 5/4). Khí xuân ấm áp ôn hòa, âm dương cân đối nhất.";
  }

  const resultTemplates: Record<string, Omit<HanNhietResult, "mingType" | "subType" | "seasonDesc">> = {
    "Hàn Mệnh": {
      elementNeed: "Hỷ HỎA (Mộc sinh Hỏa trợ lực hỏa thế)",
      favorableDirections: ["Đông Nam", "Chính Nam"],
      luckyColors: ["Xanh lá cây", "Đỏ", "Cam", "Tím", "Hồng phấn"],
      unfavorableColors: ["Đen", "Xám", "Xanh nước biển", "Trắng bạc"],
      year2027Forecast: "Năm Đinh Mùi 2027 là năm Hỏa Thổ khô nóng rực rỡ — ĐẶC BIỆT CỰC KỲ CÓ LỢI cho người Hàn Mệnh! Hãy nắm chắc giai đoạn cuối của chu kỳ vận Mộc Hỏa 2022-2027 để dũng cảm tiến công, mở rộng kinh doanh và chớp lấy thời cơ thăng tiến.",
      lifeAdvice: "Người Hàn Mệnh cả đời hỷ các năm/đại vận mang hành HỎA và MỘC; gặp lưu niên Hỏa Thổ sẽ hanh thông thịnh vượng, gặp vận Thủy thì sự nghiệp dễ bị chững lại.",
      principles: [
        "Nhà ở hoặc bàn làm việc nên quay mặt về hướng Nam hoặc Đông Nam.",
        "Trang phục, chăn ga, phụ kiện xe cộ nên ưu tiên sắc đỏ, hồng, cam, xanh lục.",
        "Nên tắm nước ấm, bổ sung thực phẩm mang tính nhiệt/ấm như gừng, tiêu, thịt bò, táo đỏ."
      ]
    },
    "Nhiệt Mệnh": {
      elementNeed: "Hỷ THỦY (Kim sinh Thủy trợ lực thủy thế)",
      favorableDirections: ["Tây Bắc", "Chính Bắc"],
      luckyColors: ["Trắng", "Vàng kim", "Bạc", "Đen", "Xám tro", "Xanh lam"],
      unfavorableColors: ["Đỏ", "Cam", "Tím", "Xanh lá cây"],
      year2027Forecast: "Năm Đinh Mùi 2027 Hỏa Thổ quá táo nhiệt — KHÔNG LỢI cho người Nhiệt Mệnh. Bạn nên chủ trương thủ tĩnh, giữ gìn tài sản, làm việc cẩn trọng, chờ đợi từ mùa thu 2028 (khi bước vào vận Kim Thủy) mới nên bung sức mở rộng lớn.",
      lifeAdvice: "Người Nhiệt Mệnh cả đời lấy Thủy làm dụng thần; vận Kim Thủy thăng hoa rực rỡ, gặp năm Hỏa Thổ thì nên thu liễm, dưỡng sinh, tránh nóng vội đầu tư mạo hiểm.",
      principles: [
        "Bàn làm việc hoặc giường ngủ nên tọa hướng Bắc hoặc Tây Bắc.",
        "Ưu tiên mặc quần áo tông màu sáng như trắng, xám tro, xanh nước biển, đen.",
        "Nên uống nhiều nước lọc, bơi lội, nuôi bể cá cảnh trong nhà hoặc gần nơi có sông nước."
      ]
    },
    "Bình Mệnh": {
      elementNeed: "Hỷ THỦY (Hỷ Thủy nhưng không kỵ Hỏa; gặp Thủy vận là tốt nhất)",
      favorableDirections: ["Tây Bắc", "Chính Bắc", "Chính Tây"],
      luckyColors: ["Trắng", "Bạc", "Xám", "Đen", "Xanh lam (ngũ hành linh hoạt)"],
      unfavorableColors: ["Không quá kỵ màu nào, nhưng tránh dùng đơn điệu màu quá chói"],
      year2027Forecast: "Năm Đinh Mùi 2027 Hỏa Thổ đối với người Bình Mệnh ở mức trung quy trung củ, không có đại khởi đại lạc. Bạn duy trì nhịp độ ổn định, tích lũy vững chắc thì cuộc sống an khang thịnh vượng.",
      lifeAdvice: "Người Bình Mệnh có ngũ hành tương đối cân bằng, thổ có tính trung hòa nhất (thổ ẩm tốt hơn thổ khô), hỷ Thủy không kỵ Hỏa, vận Thủy phát triển nhanh hơn.",
      principles: [
        "Có thể linh hoạt sử dụng cả ngũ hành Kim Thủy Mộc Hỏa theo mùa.",
        "Thích hợp các ngành nghề kết nối, trung gian, nghiên cứu và quản lý dự án.",
        "Tâm thái bình hòa, thuận theo tự nhiên thì mọi sự đều cát tường."
      ]
    }
  };

  const template = resultTemplates[mingType];
  return {
    mingType,
    subType,
    seasonDesc,
    ...template
  };
}

// Ngũ Hành Hóa Động Thổ Cục (1997 Tô Dân Phong sáng tạo)
export const DONG_THO_CUC = {
  title: "Ngũ Hành Hóa Động Thổ Cục",
  author: "Tô Dân Phong (Sáng tạo từ năm 1997)",
  originBook: "Trích cuốn Lịch Thư Sinh Tiếu Vận Trình (trang 25-29)",
  coreRule: "Khi đối diện cửa nhà có công trình xây dựng, đào đường phá đất (phạm Mậu Kỷ Đô Thiên Sát). Nguyên tắc: Chọn vật phẩm khắc sát phương vị làm khởi đầu, sau đó xếp 5 vật theo vòng ngũ hành tương sinh đảo nghịch để hóa giải triệt để sát khí.",
  directions: {
    "Nam (Hỏa Sát)": {
      starter: "Chén nước (Thủy khắc Hỏa)",
      sequence: ["1. Chén Nước (Thủy)", "2. Hộp Nhạc Kim Loại (Kim)", "3. Hòn Đá/Thạch Anh (Thổ)", "4. Vật Màu Đỏ (Hỏa)", "5. Chậu Cây Xanh (Mộc)"],
      explanation: "Nước khắc Hỏa sát khởi đầu, tiếp theo là Kim sinh Thủy, Thổ sinh Kim, Hỏa sinh Thổ, Mộc sinh Hỏa tạo thành chuỗi tương sinh đảo nghịch bảo vệ toàn diện."
    },
    "Tây Nam & Đông Bắc (Thổ Sát)": {
      starter: "Chậu Cây Xanh (Mộc khắc Thổ)",
      sequence: ["1. Chậu Cây Xanh (Mộc)", "2. Chén Nước (Thủy)", "3. Hộp Nhạc Kim Loại (Kim)", "4. Hòn Đá/Thạch Anh (Thổ)", "5. Vật Màu Đỏ (Hỏa)"],
      explanation: "Cây xanh Mộc khắc Thổ sát khởi đầu, tiếp theo Thủy sinh Mộc, Kim sinh Thủy, Thổ sinh Kim, Hỏa sinh Thổ thành luồng sinh khí luân chuyển."
    },
    "Tây & Tây Bắc (Kim Sát)": {
      starter: "Vật Phẩm Màu Đỏ (Hỏa khắc Kim)",
      sequence: ["1. Vật Màu Đỏ (Hỏa)", "2. Chậu Cây Xanh (Mộc)", "3. Chén Nước (Thủy)", "4. Hộp Nhạc Kim Loại (Kim)", "5. Hòn Đá/Thạch Anh (Thổ)"],
      explanation: "Vật màu đỏ Hỏa khắc Kim sát khởi đầu, tiếp theo Mộc sinh Hỏa, Thủy sinh Mộc, Kim sinh Thủy, Thổ sinh Kim hóa sát thành quyền."
    },
    "Bắc (Thủy Sát)": {
      starter: "Hòn Đá / Thạch Anh (Thổ khắc Thủy)",
      sequence: ["1. Hòn Đá/Thạch Anh (Thổ)", "2. Vật Màu Đỏ (Hỏa)", "3. Chậu Cây Xanh (Mộc)", "4. Chén Nước (Thủy)", "5. Hộp Nhạc Kim Loại (Kim)"],
      explanation: "Đá/Thổ khắc Thủy sát khởi đầu, tiếp theo Hỏa sinh Thổ, Mộc sinh Hỏa, Thủy sinh Mộc, Kim sinh Thủy."
    }
  }
};

// Toàn bộ dữ liệu 12 con giáp 2027 Đinh Mùi tiếng Việt
export const ZODIAC_2027_VI: Record<string, any> = {
  "Tý": {
    "name": "Tý (Chuột)",
    "chinese": "鼠",
    "english": "Rat",
    "icon": "🐭",
    "relation": "Hại Thái Tuế",
    "relationBadge": "tai",
    "themeYear": "Vận Trình Ẩn Trầm • Cẩn Trọng Thị Phi",
    "auspiciousStars": [
      "Thiên Đức",
      "Nguyệt Đức",
      "Phúc Tinh"
    ],
    "inauspiciousStars": [
      "Quyển Thiệt",
      "Giao Sát",
      "Kiếp Sát"
    ],
    "overview": "Người tuổi Tý năm nay bước vào năm **Hại Thái Tuế** (Tý Mùi tương hại). Địa chi Tý Thủy cùng lưu niên Thái Tuế Mùi Thổ tạo thành cục diện tương khắc ngầm, các mối quan hệ nhân tế dễ sinh sóng ngầm, chuyện tiểu nhân ám hại hao tổn ngầm nhiều hơn các năm trước. May mắn thay, Tý Thủy được Thân Tý Thìn tam hợp trợ lực, trong bóng tối vẫn có quý nhân âm thầm phù trì, cho nên năm nay tuyệt nhiên không phải hoàn toàn bế tắc. Chỉ cần hành sự khiêm tốn, nói ít làm nhiều, thì có thể giảm nhẹ tối đa ảnh hưởng tiêu cực của cục diện tương hại.",
    "starsAnalysis": "Năm nay cát tinh có **Thiên Đức**, **Nguyệt Đức**, **Phúc Tinh**: Thiên Đức và Nguyệt Đức đồng lâm mang sức mạnh phùng hung hóa cát rất mạnh, gặp chuyện trắc trở nhiều khi có bước ngoặt bất ngờ; Phúc Tinh chiếu mệnh giúp việc vụn vặt đời thường suôn sẻ, tâm cảnh bình ổn. Hung tinh có **Quyển Thiệt**, **Giao Sát**, **Kiếp Sát**: Quyển Thiệt chủ khẩu thiệt thị phi, lời ăn tiếng nói dễ chuốc lấy hiểu lầm; Giao Sát cùng Kiếp Sát quấn thân, việc giao dịch tiền bạc cần thận trọng, không nên đứng ra bảo lãnh cho người khác. Nhìn chung, năm nay là 'trong cát ẩn hung', giữ vững phòng thủ là thượng sách, không nên cưỡng cầu đột phá liều lĩnh.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa viêm Thổ táo, Hỏa sinh Thổ, Thổ lại khắc Thủy. Bề ngoài đối với người Hàn Mệnh dường như có lợi, song Tý Mùi tương hại làm suy yếu thế Thủy, tin rằng vận trình sẽ càng thêm trồi sụt gập ghềnh. Nửa đầu năm còn có thể tiến thủ, nửa cuối năm nên thu liễm, lấy thủ làm công là tốt hơn cả.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Năm Hỏa Thổ đương lệnh vốn đã thiên về khô nóng, người Nhiệt Mệnh lại gặp khí này thì tâm trạng dễ dao động bồn chồn, tài vận cũng trồi sụt thất thường. Năm nay nên tăng cường đi về phương Tây Bắc, mượn khí Kim Thủy điều hòa để làm dịu bớt cái nóng nực của lưu niên.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5, trước Thanh Minh thì bình hòa hơn, sau Thanh Minh thì thiên nhiệt): Người Bình Mệnh năm nay vận thế trung quy trung củ, không có đại khởi đại lạc. Kim Thủy tương đối có lợi, hãy mặc nhiều trang phục màu trắng, vàng kim, bạc, đen, xám tro, xanh lam, mọi quyết định hàng ngày lấy sự vững vàng làm nguyên tắc, tin rằng một năm cũng sẽ bình an trôi qua.",
    "birthYears": [
      {
        "year": 2020,
        "canChi": "Canh Tý",
        "age": "8 tuổi âm",
        "reading": "Người sinh năm Canh Tý năm nay Hại Thái Tuế, song tuổi đời còn nhỏ, biến động vận thế chủ yếu nằm ở môi trường gia đình. Bất luận cha mẹ dọn nhà hay chuyển việc đều không cần lo lắng, trong động tự có cơ hội, sự trưởng thành của con trẻ càng thêm vững chãi."
      },
      {
        "year": 2008,
        "canChi": "Mậu Tý",
        "age": "20 tuổi âm",
        "reading": "Người sinh năm Mậu Tý đang độ học hành hoặc mới bước vào đời, năm Hại Thái Tuế nhân sự biến động nhiều, bạn bè đồng nghiệp dễ có lời qua tiếng lại, song chớ bận lòng. Hãy dựa vào việc học thêm hoặc chuyển vị trí, động trung đới cơ, ngược lại có thể tìm ra phương hướng trong biến động."
      },
      {
        "year": 1996,
        "canChi": "Bính Tý",
        "age": "32 tuổi âm",
        "reading": "Người sinh năm Bính Tý bước vào xã hội vài năm, sự nghiệp đang trên đà đi lên. Năm nay Hại Thái Tuế, phòng ngừa hợp tác đổ vỡ hoặc tiểu nhân thị phi, phàm sự nên tự tay làm; song vận thế tổng thể trong động mang lại thời cơ, chuyển việc hay khai mở mảng mới đều có triển vọng."
      },
      {
        "year": 1984,
        "canChi": "Giáp Tý",
        "age": "44 tuổi âm",
        "reading": "Người sinh năm Giáp Tý vận trung niên lấy vững chắc làm trọng. Năm nay Hại Thái Tuế, kỵ cùng người khác hùn hạp quá sâu, phòng ngừa sơ suất hợp đồng; khi cần động mà chưa thể động, tĩnh giữ chức vụ hiện tại sẽ chắc chắn hơn. Tài vận không thể đầu cơ, động trung đới cơ chỉ ở con đường chính đạo."
      },
      {
        "year": 1972,
        "canChi": "Nhâm Tý",
        "age": "56 tuổi âm",
        "reading": "Người sinh năm Nhâm Tý sự nghiệp tài vận tiến gần mùa gặt hái. Năm nay Hại Thái Tuế, tượng Dịch Mã khiến bôn ba khó tránh, thu hoạch chưa hẳn tương xứng với nhọc nhằn; song nếu xem biến động là thời cơ để tái cơ cấu tài sản, động trung đới cơ, cũng có thể an ổn quá độ."
      },
      {
        "year": 1960,
        "canChi": "Canh Tý",
        "age": "68 tuổi âm",
        "reading": "Người sinh năm Canh Tý tuổi đã hoa giáp, năm Hại Thái Tuế sức khỏe cần phòng bệnh huyết áp hay tim mạch, không nên làm việc quá sức. Gia đạo có con cái mang lại chút bận lòng nhỏ, song bạn đời bên cạnh tương trợ hóa giải; sinh hoạt ăn uống điều độ đúng giờ là tốt."
      },
      {
        "year": 1948,
        "canChi": "Mậu Tý",
        "age": "80 tuổi âm",
        "reading": "Người sinh năm Mậu Tý năm nay Hại Thái Tuế, song áp lực lưu niên không đáng lo, trái lại con cái gia trạch có nhiều việc cần lo nghĩ. Tin rằng với vốn sống phong phú bạn có thể thong dong đối diện; sức khỏe phòng thấp nhiệt hoặc tỳ vị khó chịu, ăn uống thanh đạm thì một năm bình an."
      },
      {
        "year": 1936,
        "canChi": "Bính Tý",
        "age": "92 tuổi âm",
        "reading": "Người sinh năm Bính Tý tuổi cao hưởng thọ, vận thế an nhàn. Năm nay Hại Thái Tuế, sức khỏe phòng chứng đau đầu váng vất, đi đứng sinh hoạt nên có người kề bên; gia đình hòa thuận con cháu chu đáo, động trung đới cơ, tự nhiên an nhiên hưởng tuổi già."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên mang lại nguồn tài lộ, thương thảo hợp tác tương đối thuận lợi. Song năm Hại Thái Tuế, đầu tư mới không nên xuống tay quá lớn, thử sức quy mô nhỏ thì được.",
        "career": "Văn Xương chi khí ngầm ẩn, lợi cho học tập nâng cao, thi lấy chứng chỉ, các kế hoạch công việc mới nên thai nghén thời điểm này. Song quan hệ với cấp trên ở mức bình thường, báo cáo công việc nên ngắn gọn trực tiếp.",
        "love": "Đào hoa tinh động, người độc thân hoạt động xã giao tăng lên, có cơ hội quen biết đối tượng mới. Người đã có bạn đời nên tăng cường giao lưu trò chuyện, tránh vì chuyện nhỏ mà tích tụ hiểu lầm.",
        "health": "Đầu xuân hàn ẩm chưa tan, chú ý xương khớp và tỳ vị, ăn uống nên thanh đạm. Nhân duyên tuy tốt nhưng tiệc tùng tiếp khách cũng cần tiết chế, tránh tổn thương gan và dạ dày.",
        "dispute": "Tháng nhân duyên thị phi tương đối ít, song nói nhiều tất có sơ sót, lúc trò chuyện phiếm chớ bình phẩm chuyện riêng tư của người khác để tránh xa rắc rối vô cớ."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tứ Lục Văn Khúc tinh nhập trung cung, tài vận bình bình, thiên tài chớ cưỡng cầu. Tháng Dịch Mã có thể có cơ hội kiếm tiền từ phương xa, song năm Hại Thái Tuế, hợp tác nơi xa cần thẩm tra kỹ lưỡng các điều khoản.",
        "career": "Công việc có cơ hội đi xa, điều động hoặc công tác, trong biến động ngầm chứa thời cơ. Song Mão Mộc hình Tý Thủy, đồng nghiệp dễ phát sinh va chạm, phàm sự lấy hòa làm quý.",
        "love": "Tượng tụ ít xa nhiều, người độc thân tình duyên nơi xa khá đậm. Người đã có bạn đời nếu phải tạm xa cách nên thường xuyên liên lạc duy trì, tránh sinh khoảng cách ngăn cách.",
        "health": "Bệnh Phù tinh đương lệnh, chú ý hệ hô hấp và bệnh cũ tái phát. Tháng Dịch Mã đi lại xe cộ thường xuyên, người lái xe đặc biệt cần tập trung tinh thần, tránh đi đường dài ban đêm.",
        "dispute": "Đi xa dễ gặp tiểu nhân thị phi, trong môi trường xa lạ chớ nhẹ dạ tin người, văn bản hợp đồng xem kỹ là thượng sách để giảm bớt nỗi lo về sau."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tam Bích Lộc Tồn tinh nhập trung cung, tiền đến tiền đi, chính tài tạm ổn, thiên tài chớ đụng vào. Tháng này không nên cho người khác vay mượn, cũng kỵ đứng ra bảo lãnh cho bạn bè, tránh rước lấy tổn thất liên đới.",
        "career": "Thìn là Thủy khố, Tý Thìn bán hợp, công việc vẫn có lực trợ giúp; song tháng tam hình, các phòng ban dễ sinh tranh cãi. Nên tập trung làm tròn bổn phận, ít can thiệp vào tranh chấp của người khác để tự bảo vệ mình.",
        "love": "Tâm trạng dễ bị ảnh hưởng bởi công việc, ở bên bạn đời kỵ mang áp lực bên ngoài về nhà. Người độc thân đào hoa ảm đạm, cưỡng cầu vô ích.",
        "health": "Thổ Mộc giao chiến, chú ý dạ dày đường ruột và dị ứng da. Tháng tam hình tâm trạng dao động khá lớn, nên vận động thích hợp để giải tỏa, tránh suy nghĩ tiêu cực quẩn quanh.",
        "dispute": "Tháng này là một trong những đỉnh điểm thị phi trong năm, tranh chấp khẩu thiệt phát sinh dồn dập. Dù ở công sở hay đời sống, nói ít làm nhiều là thượng sách, phát ngôn trên mạng cũng cần thận trọng."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Nhị Hắc Cự Môn tinh nhập trung cung, lợi cho việc cầu tài bằng kiến thức chuyên môn, các ngành văn hóa, giáo dục, sáng tạo có nguồn thu khá hơn. Song tháng tương hại tài vận trồi sụt, chi tiêu lớn nên suy nghĩ kỹ.",
        "career": "Văn Xương trợ lực, thi cử, phỏng vấn, thuyết trình đề xuất đều có cơ hội thể hiện. Song Tỵ Hỏa làm hao tổn Tý Thủy, khối lượng công việc tăng vọt, cần chú ý phân bổ thời gian tránh nhìn việc nọ mất việc kia.",
        "love": "Tháng tương hại nhân sự nhạy cảm, chuyện tình cảm dễ sinh hiểu lầm, biến chuyện nhỏ thành chuyện lớn. Nên thẳng thắn giao lưu, kỵ chiến tranh lạnh né tránh; người độc thân không nên vội vã quyết định.",
        "health": "Hỏa viêm Thổ táo, chú ý tâm hỏa bốc lên, chất lượng giấc ngủ giảm sút. Ăn uống nên bổ sung đồ thanh nhuận, sinh hoạt nghỉ ngơi đúng giờ giấc là trọng yếu.",
        "dispute": "Tương hại cộng thêm Quyển Thiệt, trong lời nói dễ làm mếch lòng người khác. Họp hành thảo luận nên lắng nghe trước nói sau, email tin nhắn kiểm tra lại đôi ba lần để giảm sai sót vô tâm."
      },
      {
        "month": "Tháng Năm (Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Nhất Bạch Tham Lang tinh nhập trung cung, chính tài tạm vững, thiên tài chớ màng. Tháng Lục Hợp có cơ hội hợp tác cầu tài, song Ngũ Hoàng đương lệnh, các khoản đầu tư trọng đại nên hoãn lại, tiền mặt là vua.",
        "career": "Tý Sửu lục hợp, nơi làm việc dễ được đồng nghiệp phối hợp, dự án xúc tiến thuận lợi. Song Ngọ Mùi hợp Hỏa, áp lực ngầm ẩn, khi thành công càng kỵ phong mang quá lộ kẻo chuốc người đố kỵ.",
        "love": "Tháng Đào Hoa nhân duyên chan hòa, người độc thân giao lưu tiệc tùng nhiều, có cơ hội gặp đối tượng ưng ý. Người đã có bạn đời tình cảm thêm mặn nồng, nên nắm bắt thời cơ thắt chặt quan hệ.",
        "health": "Nhất Bạch nhập trung cung mang điềm tai bệnh, tháng này cơ thể khá nhạy cảm yếu ớt, tránh hoạt động nguy hiểm cao. Ngọ Hỏa đương lệnh, chú ý tim và mắt, nghỉ ngơi đầy đủ là căn bản.",
        "dispute": "Tháng Đào Hoa nhân duyên tuy tốt, song năm Hại Thái Tuế, bề ngoài thân thiện có thể ẩn chứa sóng ngầm. Kết bạn nên nhìn hành vi, lắng nghe lời nói, chớ vội dốc hết ruột gan."
      },
      {
        "month": "Tháng Sáu (Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Cửu Tử Hữu Bật tinh nhập trung cung, trên lý thuyết lợi cho tài vận, song tháng này là tháng tương xung, tiền vào cửa trước ra cửa sau khó tích lũy. Nên cắt giảm chi tiêu không cần thiết, tích trữ phòng khi cấp bách.",
        "career": "Tháng Xung Thái Tuế biến động khá lớn, có thể gặp điều động đột xuất, dự án tạm dừng. Biến hóa chưa hẳn là họa, thuận thế hành sự, linh hoạt ứng đối ngược lại thấy cơ hội chuyển mình.",
        "love": "Tháng tương xung tâm trạng trồi sụt, với bạn đời dễ xảy ra tranh cãi, nên lùi một bước. Người độc thân tình cảm biến hóa nhanh, không nên vội vàng lao vào, quan sát trước là hơn.",
        "health": "Tháng xung dễ bị ngoại thương va quẹt, lái xe, vận động đều cần hết sức cẩn thận. Mùi Thổ khắc Tý Thủy, chú ý hệ tiết niệu và bệnh cũ ở vùng thắt lưng, tránh ngồi lâu.",
        "dispute": "Tháng này là một đỉnh điểm thị phi khác trong năm, quyết định bốc đồng dễ sinh hối hận. Dù chuyển việc hay tranh chấp nhân sự, nên bình tĩnh suy nghĩ 3 ngày rồi mới quyết định để giảm thiểu sai sót do kích động."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Bát Bạch Tả Phụ tinh nhập trung cung, là tháng phòng ngừa phá tài. Thân Tý bán hợp, tài vận hơi hồi phục ổn định, song Thất Xích chủ trộm cắp hao tổn, đồ quý giá phải cất giữ cẩn mật, ra ngoài chú ý ví tiền.",
        "career": "Tháng bình ổn nhịp độ công việc hồi phục bình thường, những nhiễu nhương nửa đầu năm dần lắng dịu. Thân Kim sinh Tý Thủy, nơi công sở có trưởng bối hoặc cấp trên chỉ dẫn, nên khiêm tốn lắng nghe tiếp thu.",
        "love": "Đời sống tình cảm êm ả, không sóng to gió lớn cũng không có bất ngờ lớn. Người có bạn đời nên thu xếp chuyến đi ngắn ngày bồi đắp tình cảm. Người độc thân duyên phận chưa tới, cưỡng cầu vô ích.",
        "health": "Sang thu Kim vượng, người hệ hô hấp yếu cần lưu ý. Bát Bạch nhập trung cũng phòng tổn thương do kim loại, dao kéo trong bếp hay môi trường công trường cần chú ý cẩn thận.",
        "dispute": "Tháng bình ổn thị phi giảm bớt rõ rệt, quan hệ nhân tế dần hòa hoãn. Song gốc rễ năm Hại Thái Tuế chưa dứt, đối nhân xử thế vẫn nên khiêm nhường, không thể vì nhất thời thuận lợi mà quên mình."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Thất Xích Phá Quân tinh nhập trung cung, đại lợi tài vận, là tháng tài vận khá tốt trong năm. Cả chính tài lẫn thiên tài đều có thu hoạch, song năm Hại Thái Tuế, sau khi có tiền nên kín đáo, tránh chuốc người dòm ngó.",
        "career": "Thất Xích nhập trung phòng ngừa tổn thất phá tài, Dậu Kim sinh Tý Thủy, vận quý nhân âm thầm tương trợ, hãy nắm bắt cơ hội thể hiện năng lực.",
        "love": "Tháng bình ổn tình cảm hòa thuận, người có bạn đời quan hệ vững vàng, có thể bàn bạc kế hoạch lâu dài. Người độc thân đào hoa bình thường, chuyên tâm cho sự nghiệp thực tế hơn.",
        "health": "Khí thu hanh táo đương lệnh, chú ý da dẻ và cổ họng khô rát, uống nhiều nước là trọng. Thất Xích nhập trung phòng ngừa hao hụt thương tích.",
        "dispute": "Khi tài vận tốt dễ chuốc lòng ghen ghét, trước thành quả nên khiêm tốn. Bất luận thu nhập tăng hay đổi chức vụ, ít phô trương, làm việc thực tế thì có thể tránh xa vòng xoáy thị phi."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Lục Bạch Vũ Khúc tinh nhập trung cung, việc hỷ sự có thể kéo theo chi tiêu như cưới hỏi, sinh con, mua nhà. Tháng tam hình tài vận trồi sụt, chi tiêu lớn cần bàn bạc với người nhà, tự quyết dễ sinh tranh cãi.",
        "career": "Tuất Thổ khắc Tý Thủy, áp lực công việc tái hiện, dễ bất đồng ý kiến với cấp trên hoặc khách hàng. Tháng tam hình, chi tiết hợp đồng, giấy tờ pháp lý nên kiểm tra lại nhiều lần tránh sinh rắc rối.",
        "love": "Lục Bạch nhập trung cung, có lợi cho địa vị thiên tài, song tháng tam hình cảm xúc căng thẳng, quá trình chuẩn bị việc hỷ nên thông cảm cho nhau, tránh vì việc nhỏ tổn thương hòa khí.",
        "health": "Tháng Thổ vượng, gánh nặng hệ tiêu hóa khá lớn, ăn uống kỵ quá độ. Lục Bạch nhập trung cần chú ý điều hòa sức lực cơ thể.",
        "dispute": "Tam hình cộng hưởng dư khí sao thị phi, tháng này khẩu thiệt phân tranh khá nhiều. Nơi công sở kỵ đứng về một phe, trong cuộc sống ít bình phẩm chuyện người khác, tin rằng có thể giảm bớt ảnh hưởng hình khắc."
      },
      {
        "month": "Tháng Mười (辛亥 - Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Ngũ Hoàng Liêm Trinh tinh tái nhập trung cung, nhân duyên và tài lộ đều thông suốt. Thế tam hợp Thân Tý Thìn lợi cho việc hợp tác nhóm cầu tài, hoặc cùng bạn bè cũ tái khởi động kế hoạch hợp tác, đều có thu hoạch.",
        "career": "Tháng tam hợp vận quý nhân mạnh, công việc dễ được đồng nghiệp ủng hộ, khó khăn được giải quyết êm đẹp. Hợi Thủy trợ giúp Tý Thủy, suy nghĩ thông suốt, công việc mảng trù hoạch, sáng tạo đặc biệt có lợi.",
        "love": "Nhân duyên chan hòa, người độc thân qua bạn bè giới thiệu có cơ hội quen biết đối tượng. Người đã có bạn đời hoạt động giao tế nhiều lên, nên cân bằng thời gian giữa bạn đời và bạn bè.",
        "health": "Tháng Thủy vượng, thận và bàng quang cần chú ý, đặc biệt là người ngồi lâu một chỗ. Ngũ Hoàng nhập trung cũng chủ về cảm xúc, nên giữ thái độ lạc quan, tránh đa sầu đa cảm.",
        "dispute": "Tháng tam hợp thị phi giảm mạnh, quan hệ nhân tế hòa hợp. Song năm Hại Thái Tuế, tình cảm hữu hảo vẫn cần vun vén, việc đã hứa với người khác nên thực hiện chu đáo để giữ trọn thanh danh."
      },
      {
        "month": "Tháng Mười Một (Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tứ Lục Văn Khúc tinh nhập trung cung, lại gặp tháng Hại Thái Tuế, tài vận tương đối thấp kém. Chính tài tạm duy trì, thiên tài chớ màng, quyết định đầu tư nên tạm dừng, lấy quan sát làm thượng sách.",
        "career": "Tý Thủy trùng điệp, khối lượng công việc tăng vọt, song tháng Hại Thái Tuế có tiểu nhân ngầm gièm pha, thành quả có thể bị người khác chia sẻ bớt. Nên âm thầm cày xới, không tranh giành danh tiếng nhất thời, về lâu dài sẽ có lợi hơn.",
        "love": "Tâm trạng dao động khá lớn, với bạn đời dễ vì việc vụn vặt mà cãi vã, nên bao dung nhiều hơn. Người độc thân đào hoa ảm đạm, phần lớn là duyên bèo nước, không nên quá thật lòng vội vã.",
        "health": "Tháng này là vùng trũng sức khỏe của cả năm, Bệnh Phù tinh kết hợp Hại Thái Tuế, bệnh cũ dễ tái phát. Chú ý giữ ấm, tránh nhiễm lạnh, kiểm tra định kỳ không thể lơ là.",
        "dispute": "Tháng Hại Thái Tuế thị phi khó tránh, tin đồn đặt điều có thể xuất hiện. Cây ngay không sợ chết đứng, không nên vội vã đôi co thanh minh, thời gian tự chứng minh chân tướng, phản ứng kích động chỉ như thêm dầu vào lửa."
      },
      {
        "month": "Tháng Chạp (Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tam Bích Lộc Tồn tinh nhập trung cung, tháng Tuế Phá tài vận trồi sụt, tiền thưởng cuối năm hoặc có biến đổi ngoài ý muốn. Quản lý tài chính nên bảo thủ, chuẩn bị đạn dược dự trữ cho năm tới sáng suốt hơn là mạo hiểm.",
        "career": "Tháng Tuế Phá biến động khá lớn, có thể xuất hiện tin tức tái cơ cấu tổ chức, điều chỉnh nhân sự. Sửu Mùi tương xung, quan hệ với cấp trên cần cẩn thận duy trì, kỳ đánh giá cuối năm không được lơ là chủ quan.",
        "love": "Tháng tương xung tình cảm dễ sinh biến, người có bạn đời kỵ vì việc sắp xếp ngày lễ mà tranh cãi, nhường nhịn nhau là thượng sách. Người độc thân tiệc tùng cuối năm nhiều, song phần lớn là bạn bè xã giao.",
        "health": "Cuối năm tiếp khách dày đặc, ăn uống cần tiết chế tránh tổn hại gan dạ dày. Tháng Tuế Phá cũng phòng tai nạn bất ngờ, đi lại dịp lễ nên lên kế hoạch từ sớm, tránh vội vã chạy xe.",
        "dispute": "Tam Bích thị phi tinh cộng thêm tháng Tuế Phá là thời điểm thị phi thịnh nhất trong cả năm. Dù tổng kết công việc hay sum họp người thân, lời ăn tiếng nói kỵ chạm vào đề tài nhạy cảm, khép lại năm nay một cách khiêm nhường để mở ra không gian cho năm mới."
      }
    ],
    "yearSummary": "Năm Hại Thái Tuế, trong cát tàng hung, trong hung cũng có cát. Người tuổi Tý năm nay nên lấy thủ làm công, nhân tế lưu tâm nhiều hơn, tài chính cẩn thận hơn, thân thể bảo trọng nhiều hơn. Có Thiên Nguyệt nhị đức che chở, tin rằng chỉ cần vững bước tiến về phía trước, không cưỡng cầu, không mạo hiểm, một năm sẽ bình an trôi qua, sang năm tới tự khắc có thể tính toán mở mang."
  },
  "Sửu": {
    "name": "Sửu (Trâu)",
    "chinese": "牛",
    "english": "Ox",
    "icon": "🐂",
    "relation": "Xung Thái Tuế",
    "relationBadge": "tai",
    "themeYear": "Chuyển Động Cầu Tài • Đổi Mới Lập Nghiệp",
    "auspiciousStars": [
      "Địa Giải",
      "Thiên Giải"
    ],
    "inauspiciousStars": [
      "Đại Hao",
      "Lan Can",
      "Tuế Phá"
    ],
    "overview": "Người tuổi Sửu năm nay bước vào năm **Xung Thái Tuế** (Sửu Mùi tương xung), là một trong những tuổi có biên độ biến động lớn nhất trong năm Đinh Mùi. Cổ nhân có câu: 'Thái Tuế đương đầu tọa, vô hỷ tất hữu họa; xung khởi Thái Tuế vị, động trung kiến cát hung'. Xung tượng trưng cho sự xáo trộn, chuyển dịch chỗ ở, thay đổi chức vụ, xuất ngoại hoặc chia tách đối tác. Song trong biến động lại ẩn chứa bước ngoặt lớn để phá vỡ thế bế tắc cũ, chủ động biến đổi (như nhảy việc, đi xa, sửa sang nhà cửa) thì có thể biến xung thành cơ hội phát triển vượt bậc.",
    "starsAnalysis": "Năm nay cát tinh có cặp đôi **Địa Giải** và **Thiên Giải**: Cả hai đều chủ về năng lực giải ách tiêu tai phi thường, gặp hoàn cảnh khốn khó ngặt nghèo vẫn tìm được lối thoát hoặc có quý nhân xuất hiện gỡ rối kịp thời, báo hiệu khó khăn cuối cùng đều có thể vượt qua. Tuy nhiên hung tinh vây hãm khá nặng gồm có **Đại Hao**, **Lan Can**, **Tuế Phá**: Đại Hao chủ về hao tài tốn của ngoài dự liệu, chi tiêu đầu tư cần tính toán kỹ; Lan Can gây cản trở trắc trở về mặt thủ tục pháp lý; Tuế Phá cảnh báo các mối quan hệ xã giao dễ bị rạn nứt bất ngờ. Lời khuyên vàng cho tuổi Sửu là giữ dòng tiền mặt an toàn, dĩ hòa vi quý, không nên tham gia các trò đỏ đen mạo hiểm.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ khô nóng, rất cần Hỏa sưởi ấm cho Hàn Mệnh, song do gặp năm Xung Thái Tuế nên vận thế sẽ như sóng cồn nhấp nhô. Nửa đầu năm mượn Hỏa thế tiến công gặt hái, nửa cuối năm khi khí Kim Thủy manh nha thì nên thu vén bảo toàn thành quả.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Hỏa Thổ quá vượng lại gặp thêm Xung Thái Tuế làm cho tâm trạng người Nhiệt Mệnh vô cùng bồn chồn nóng nảy, dễ đưa ra quyết định sai lầm. Hãy bổ sung yếu tố Thủy (hướng Tây Bắc, trang phục màu đen, xám, lam, trắng) để hạ hỏa, tĩnh tâm ứng biến.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Cần giữ nhịp độ ổn định, không nên đầu tư liều lĩnh, chú ý bảo vệ xương khớp và tỳ vị tiêu hóa, tích lũy nội lực vững vàng thì sóng gió nào cũng có thể vượt qua an lành.",
    "birthYears": [
      {
        "year": 2021,
        "canChi": "Tân Sửu",
        "age": "7 tuổi âm",
        "reading": "Tuổi thơ năm Xung Thái Tuế dễ có sự thay đổi về môi trường sinh hoạt hoặc trường lớp. Cha mẹ cần kiên nhẫn vỗ về tâm lý, chú ý đề phòng té ngã trầy xước chân tay khi chạy nhảy nô đùa."
      },
      {
        "year": 2009,
        "canChi": "Kỷ Sửu",
        "age": "19 tuổi âm",
        "reading": "Bước vào giai đoạn thi cử chuyển cấp hoặc chọn trường, tâm lý dễ bồn chồn dao động. Cần tập trung vào việc học hành, tránh để chuyện bạn bè tình cảm phân tâm làm ảnh hưởng kết quả thi cử."
      },
      {
        "year": 1997,
        "canChi": "Đinh Sửu",
        "age": "31 tuổi âm",
        "reading": "Độ tuổi lập nghiệp khẳng định vị trí, gặp năm Xung Thái Tuế thường có sự chuyển đổi việc làm hoặc chỗ ở. Động trung sinh tài, nếu có cơ hội phát triển ở môi trường mới hãy tự tin đón nhận."
      },
      {
        "year": 1985,
        "canChi": "Ất Sửu",
        "age": "43 tuổi âm",
        "reading": "Trụ cột gia đình đối diện nhiều áp lực tài chính và sự nghiệp. Kỵ hùn hạp làm ăn mạo hiểm hay vay mượn hộ người khác, quản lý tài chính gia đình chặt chẽ để vượt qua năm xung an toàn."
      },
      {
        "year": 1973,
        "canChi": "Quý Sửu",
        "age": "55 tuổi âm",
        "reading": "Năm Xung Thái Tuế đòi hỏi sự bình tĩnh trong các quyết định lớn. Chú ý chăm sóc sức khỏe tim mạch và huyết áp, công việc nên chuẩn bị sẵn phương án dự phòng cho mọi tình huống."
      },
      {
        "year": 1961,
        "canChi": "Tân Sửu",
        "age": "67 tuổi âm",
        "reading": "Tuổi nghỉ hưu an nhàn, nên chuyển giao việc kinh doanh cho con cháu. Chú ý chăm sóc xương khớp, đường tiêu hóa, giữ tâm trạng vui vẻ bên người thân để tận hưởng tuổi già thanh thản."
      },
      {
        "year": 1949,
        "canChi": "Kỷ Sửu",
        "age": "79 tuổi âm",
        "reading": "Tuổi cao hưởng phúc, năm Xung Thái Tuế cần đề phòng trượt ngã, đi lại trong nhà cần có ánh sáng đầy đủ và người hỗ trợ. Ăn uống ấm nóng, giữ gìn giấc ngủ ngon."
      },
      {
        "year": 1937,
        "canChi": "Đinh Sửu",
        "age": "91 tuổi âm",
        "reading": "Đại thọ trường diên, con cháu sum vầy hiếu kính chu đáo. Sinh hoạt nhẹ nhàng điều độ, sống thuận theo tự nhiên thì thân tâm an lạc trường thọ."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Chính tài bình ổn, thiên tài chớ mơ tưởng. Tháng này Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên tốt thì thương cơ dễ xuất hiện, song năm Xung Thái Tuế, đầu tư mới nên quan sát trước, không nên ồ ạt xuống tiền.",
        "career": "Kế hoạch mới trong giai đoạn thai nghén, học tập nâng cao có lợi cho lâu dài. Cấp trên hoặc khách hàng giữ thái độ thân thiện, song trước khi lời hứa thành văn bản, không nên vội vàng rêu rao.",
        "love": "Đào hoa tinh động, người độc thân nơi giao tiếp có cơ hội quen đối tượng, người có bạn đời nên tăng cường sẻ chia trò chuyện, tránh vì bận rộn mà sinh xa cách.",
        "health": "Đầu xuân còn rét, chú ý đường hô hấp và tỳ vị, ăn uống điều độ đúng giờ là mấu chốt.",
        "dispute": "Nhân duyên tuy tốt song nói nhiều tất hớ, tán gẫu nơi công sở tuyệt đối không chạm vào đời tư người khác."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Động trung cầu tài, công tác hoặc nghiệp vụ nơi xa có thu hoạch. Tháng này Tứ Lục Văn Khúc tinh nhập trung cung, chi phí sức khỏe có thể tăng lên, nên dự trù sẵn quỹ dự phòng.",
        "career": "Điềm báo biến động rõ rệt, chuyển việc, đổi chức hay đổi dự án đều có thể diễn ra. Chủ động tranh thủ đi công tác biệt phái, ngược lại có thể mượn sự chuyển động của Dịch Mã hóa giải thế ngưng trệ của Xung Thái Tuế.",
        "love": "Tụ ít xa nhiều, người độc thân tình duyên nơi xa có cơ hội nảy mầm, người đã có bạn đời cần duy trì sợi dây liên lạc tình cảm, tránh sinh hiểu lầm.",
        "health": "Bệnh Phù tinh lâm chiếu, bệnh đường ruột và bệnh cũ dễ bộc phát, sinh hoạt điều độ, tránh làm việc quá sức.",
        "dispute": "Trong lúc bôn ba vất vả, chi tiết hợp đồng cần rà soát đôi ba lần, tránh vì vội vã mà phát sinh sai sót."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tiền đến tiền đi, chính tài tạm ổn, thiên tài chớ đụng. Tháng này Tam Bích Lộc Tồn tinh nhập trung cung, dễ chuốc khẩu thiệt, giao dịch tài chính cố gắng lưu lại chứng từ rõ ràng.",
        "career": "Tam hình chồng chất, nhân sự chốn công sở nhiều sóng ngầm, cư xử với cấp trên, đồng nghiệp nên nhẫn nại khiêm nhường, quyết định trọng đại nên tạm hoãn.",
        "love": "Cảm xúc dao động khá lớn, dễ vì việc nhỏ mà tranh cãi, bình tĩnh trao đổi thì có thể hóa giải, không nên quyết định lúc nóng giận.",
        "health": "Can khí dễ uất kết, chú ý điều tiết cảm xúc, vận động vừa phải giúp sơ tiết khí trệ.",
        "dispute": "Thị phi tinh cùng tam hình tề tựu, nói ít làm nhiều là thượng sách, cuốn vào phân tranh của người khác chỉ chuốc lấy phiền phức vô ích."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Có cơ hội kiếm khoản tiền ngầm, song năm tương hại, chia phần hợp tác cần giấy trắng mực đen, anh em ruột thịt cũng phải sòng phẳng rõ ràng.",
        "career": "Tháng này Nhị Hắc Cự Môn tinh nhập trung cung, lợi cho học tập thi cử, các khóa học nâng cao chuyên môn nên triển khai tháng này. Tiểu nhân công sở ngầm ẩn, sao lưu tài liệu chớ nên lơ là.",
        "love": "Tương hại chủ sự mờ ám, người độc thân cần phân định rõ đối tượng đã có bạn đời hay chưa; người đã có bạn đời nên thẳng thắn với nhau, tránh sinh lòng nghi kỵ.",
        "health": "Thấp nhiệt tăng dần, da dẻ và hệ tiết niệu cần lưu ý, ăn uống thanh đạm là phù hợp.",
        "dispute": "Ám hại không hình bóng, kết bạn hợp tác cần xét lời nói nhìn hành vi, chớ vội dốc lòng quá nhanh."
      },
      {
        "month": "Tháng Năm (Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Tháng này Nhất Bạch Tham Lang tinh nhập trung cung, mọi việc cẩn trọng. Tài vận tuy có Lục Hợp trợ lực, song Ngũ Hoàng đương lệnh, đầu tư số tiền lớn tạm thời án binh bất động.",
        "career": "Quý nhân thấp thoáng, hợp tác với người tuổi Tý tương đối thuận lợi, dự án mới có thể bắt đầu tiếp xúc đàm phán, việc ký hợp đồng nên chờ tinh tượng ổn định hơn.",
        "love": "Đào hoa lục hợp, người độc thân cơ hội khá nhiều, song năm Xung Thái Tuế tình đến nhanh đi cũng nhanh, không nên vội vã lún sâu. Người có bạn đời tình cảm mặn nồng, có thể bàn chuyện hôn nhân.",
        "health": "Hỏa viêm Thổ táo, chú ý tim mạch và mắt, uống nhiều nước, bớt thức khuya.",
        "dispute": "Đào hoa quá vượng ngược lại chiêu mời thị phi, quan hệ khác giới giữ khoảng cách thích hợp để tránh hiểu lầm không đáng có."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Xung Thái Tuế gặp thêm tháng xung, tài vận biến động mạnh nhất, chính tài tạm ổn, thiên tài tuyệt đối kỵ, tiền mặt là vua, dự trữ sẵn nguồn quay vòng.",
        "career": "Đỉnh điểm biến động, chuyển việc, dọn nhà, dự án kết thúc đều có thể xảy ra. Tháng này Cửu Tử Hữu Bật tinh nhập trung cung lợi cho tài vận, song động tượng quá gấp gáp, trước khi quyết định nên trù tính kỹ lưỡng các phương án dự phòng.",
        "love": "Xung tất động, đôi lứa có thể đối mặt lựa chọn hợp tan, hãy suy nghĩ chín chắn về phương hướng lâu dài, quyết định bốc đồng về sau sẽ hối hận.",
        "health": "Thổ vượng ảnh hưởng tỳ vị, ăn uống thất thường dễ gây khó chịu, ra ngoài chú ý an toàn giao thông.",
        "dispute": "Tâm trạng dễ nóng nảy, thương thảo với người khác giữ vững sự nhẫn nại, lái xe thà chậm một giây hơn nhanh một phút."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này Bát Bạch Tả Phụ tinh nhập trung cung, cần phòng phá tài, chi tiêu cần có ngân sách, tiêu dùng giải trí dễ vượt mức, tiết chế là trọng.",
        "career": "Trong bình ổn có sóng ngầm, bề ngoài thuận lợi chớ vội khinh suất, chi tiết thực hiện các bước sau cần đích thân theo dõi giám sát.",
        "love": "Tháng bình đạm, người độc thân cơ hội không nhiều, người có bạn đời chung sống như thường, nên sắp xếp chuyến du lịch ngắn bồi dưỡng tình cảm.",
        "health": "Tháng Kim vượng, phổi và da dẻ cần lưu ý, thời điểm giao mùa chú ý giữ ấm cơ thể.",
        "dispute": "Phá Quân tinh chủ sự hao tổn, cho vay mượn hay đứng ra bảo lãnh nhất loạt khéo léo từ chối để tránh phiền toái về sau."
      },
      {
        "month": "Tháng Tám (己酉 - Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này Thất Xích Phá Quân tinh nhập trung cung, đại lợi tài vận, cả chính tài lẫn thiên tài đều có cơ hội, song năm Xung Thái Tuế, thấy tốt thu tay, không nên tham thắng mà chuốc bại.",
        "career": "Tài tinh cao chiếu, đánh giá thành tích hay thưởng hoa hồng có tin vui, chủ động thể hiện năng lực, cấp trên sẽ nhìn nhận thấu đáo.",
        "love": "Bình ổn hòa hợp, người có bạn đời có thể bàn bạc kế hoạch tương lai, người độc thân qua bạn bè giới thiệu có cơ hội tốt.",
        "health": "Thu táo hanh hao, nhuận phế dưỡng âm là cốt lõi, lê, bách hợp, mộc nhĩ trắng đều rất hợp thời tiết.",
        "dispute": "Vận thế thuận buồm xuôi gió càng kỵ khoe khoang phô trương, khiêm nhường kín đáo thì phúc trạch càng dài lâu."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Tháng này Lục Bạch Vũ Khúc tinh nhập trung cung, việc hỷ đào hoa, hoặc vì hỷ sự có thêm chi tiêu ngoài dự kiến, chuẩn bị trước thì không lúng túng.",
        "career": "Tam hình tái lâm, ma sát công sở dễ nảy sinh, cư xử với cấp dưới hoặc người đi sau nên bao dung nhiều hơn, chỉ thị giao việc cần rõ ràng dứt khoát.",
        "love": "Hỷ khánh tinh động, người có bạn đời thích hợp bàn chuyện hôn nhân, sinh con; lấy niềm vui nghênh đón để giải trừ sát khí hình khắc.",
        "health": "Tháng Thổ nặng nề, chú ý hệ tiêu hóa, ăn uống tránh đồ quá nhiều dầu mỡ.",
        "dispute": "Tam hình chủ sự dây dưa, giấy tờ pháp lý điều khoản hợp đồng xem kỹ là thượng sách, liên quan đến tố tụng nên tìm kiếm ý kiến chuyên gia."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Tam hợp hóa giải xung đột, tài vận dần khởi sắc, tháng này Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên đào hoa đều mang lại thương cơ, khách cũ quay lại đem theo đơn hàng mới.",
        "career": "Vận quý nhân tốt, hợp tác với người tuổi Tỵ, tuổi Dậu tương đối thuận lợi, các dự án dài hạn có thể xúc tiến mạnh mẽ trong tháng này.",
        "love": "Ngũ Hoàng tái nhập trung cung, người độc thân cơ duyên khá tốt, người có bạn đời tình cảm vững bền, có thể thu xếp kỳ nghỉ dài ngày bên nhau.",
        "health": "Tháng Thủy khí thịnh vượng, thận và hệ tiết niệu cần lưu tâm, giữ ấm thân thể đặc biệt quan trọng.",
        "dispute": "Tháng tam hợp nhân tế hài hòa, thị phi giảm bớt, song vẫn không nên đứng ra làm người trung gian để tránh rước vạ vào thân."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Hại chủ về hao tổn ngầm, chi tiêu dễ vượt mức dự toán, tháng này Tứ Lục Văn Khúc tinh nhập trung cung, các khoản chi cho sức khỏe có thể gia tăng.",
        "career": "Bề ngoài bình lặng, bên trong có thể râm ran tin đồn biến động, không nên nhẹ dạ tin lời đồn, bình tĩnh chờ mọi sự sáng tỏ mới là thượng sách.",
        "love": "Tượng tương hại ngầm, dễ sinh hiểu lầm ngờ vực, thẳng thắn trao đổi thì hóa giải được, giấu kín trong lòng ngược lại làm mâu thuẫn xấu đi.",
        "health": "Bệnh Phù tinh cùng Thủy hàn giao tranh, chú ý xương khớp và bệnh cũ, người lớn tuổi đặc biệt chú ý giữ ấm phòng trượt ngã.",
        "dispute": "Hại Thái Tuế chủ mũi tên bắn lén sau lưng, chính trị công sở tránh xa là khôn ngoan, không tỏ thái độ, không chọn phe cánh thì tự bảo toàn được mình."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tuế Phá chồng thêm Sửu Mùi xung, tài vận biến động lớn nhất, kết toán cuối năm cần hết sức cẩn thận, công nợ phải thu cố gắng thu hồi sớm.",
        "career": "Điềm báo biến động tái xuất hiện, tổng kết được mất cả năm, kế hoạch năm tới có thể bắt đầu thai nghén, song không nên vội vàng triển khai trong tháng này.",
        "love": "Xung tất động, tình nhân có thể đối mặt thử thách cách trở nơi xa, lấy lòng tin làm nền tảng thì sẽ cùng nhau vượt qua.",
        "health": "Tháng này Tam Bích Lộc Tồn tinh nhập trung cung, phòng ngừa khẩu thiệt thị phi, tâm trạng dễ dao động, chú ý sức khỏe tinh thần, vận động điều độ giúp xả stress.",
        "dispute": "Tháng Tuế Phá, lời ăn tiếng nói đặc biệt cần cẩn trọng, tiệc tùng cuối năm uống rượu kỵ nói nhiều, bình an quá độ thì năm mới đầy hứa hẹn."
      }
    ],
    "yearSummary": "Người tuổi Sửu trải qua năm Đinh Mùi Xung Thái Tuế với biên độ chuyển dịch lớn. Cặp sao Thiên Giải và Địa Giải luôn kề cận nâng đỡ để hóa hiểm thành an. Chỉ cần biết cách 'thuận thế chuyển động', nắm bắt cơ hội đổi mới, quản lý tiền bạc chặt chẽ và không ngừng hoàn thiện bản thân, bạn hoàn toàn có thể lội ngược dòng gặt hái thành công vang dội."
  },
  "Dần": {
    "name": "Dần (Hổ)",
    "chinese": "虎",
    "english": "Tiger",
    "icon": "🐯",
    "relation": "Ám Hợp Thái Tuế",
    "relationBadge": "normal",
    "themeYear": "Ám Hợp Quý Nhân • Tích Lũy Nội Lực",
    "auspiciousStars": [
      "Thiên Đức",
      "Phúc Tinh",
      "Bát Tọa",
      "Phan An"
    ],
    "inauspiciousStars": [
      "Kiếp Sát",
      "Tử Phù",
      "Tiểu Hao",
      "Tam Hình Dần Tỵ Thân"
    ],
    "overview": "Người tuổi Dần năm Đinh Mùi 2027 bước vào năm **Ám Hợp Thái Tuế** (Dần Mùi ám hợp). Ám hợp chủ về có quý nhân ngầm âm thầm trợ giúp, cơ hội hợp tác kinh doanh hay nâng đỡ chức vụ thường không biểu lộ rầm rộ ngoài mặt mà đến từ sự kết nối kín đáo, tin cậy. Năm nay không phạm xung Thái Tuế, vận trình tổng thể duy trì đà đi lên vững vàng. Chỉ cần bạn giữ tác phong khiêm nhường, làm việc kín kẽ, nói ít làm nhiều thì tài lộc và danh vị đều bội thu.",
    "starsAnalysis": "Năm nay cát tinh hội tụ rất sáng gồm có **Thiên Đức**, **Phúc Tinh**, **Bát Tọa**, **Phan An**: Thiên Đức chủ quý nhân che chở phùng hung hóa cát; Phúc Tinh chiếu mệnh mang lại cuộc sống an ổn ấm êm; Bát Tọa nâng đỡ địa vị công danh chốn công sở; Phan An chủ về sự chuyển đổi thuận lợi, rất có lợi cho việc đi công tác, xuất ngoại hoặc phát triển thị trường mới. Tuy nhiên hung tinh cũng cần lưu ý gồm có **Kiếp Sát**, **Tử Phù**, **Tiểu Hao** cùng dư khí **Tam Hình Dần Tỵ Thân**: Kiếp Sát chủ hao tổn tài vật ngầm, đầu tư cần thẩm tra kỹ; Tử Phù nhắc nhở chăm sóc sức khỏe người lớn tuổi trong nhà; Tiểu Hao gây thất thoát tiền bạc nhỏ nhặt thường xuyên; tháng Tư và tháng Bảy âm lịch cần đề phòng tranh chấp nhân sự.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ khô nóng là năm tiếp nối vận may của bạn, tin rằng vận trình sẽ càng thêm hanh thông trôi chảy. Chu kỳ Mộc Hỏa 2022-2027 đi vào giai đoạn cuối, khí Hỏa Thổ rất hợp với mệnh của bạn, hãy tranh thủ cơ hội tiến công mở rộng, song nửa cuối năm khi khí Kim Thủy manh nha thì nên sớm chuẩn bị phương án bảo toàn.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Năm nay là năm bình ổn thủ thành, khí Hỏa viêm Thổ táo không phải ngũ hành bạn ưa chuộng, khuếch trương cao giọng dễ chuốc tác dụng ngược. Hãy lấy tĩnh chế động, củng cố nền tảng sẵn có, quyết định trọng đại nên đợi từ năm 2028 (chu kỳ Kim Thủy) hãy xúc tiến.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Năm nay vận trình trung quy trung củ, không đại khởi đại lạc, khí Kim Thủy hơi có lợi cho bạn. Hướng Tây Bắc cùng trang phục màu trắng, bạc sẽ tăng cường vận thế, tổng thể lấy tiến bước vững chắc làm trọng.",
    "birthYears": [
      {
        "year": 2022,
        "canChi": "Nhâm Dần",
        "age": "6 tuổi âm",
        "reading": "Lưu niên ám hợp, thời thơ ấu được trưởng bối âm thầm bảo bọc, tiến độ học hỏi tuy chưa vượt trội nhưng căn cơ dần vững vàng. Giữ nếp sinh hoạt điều độ thì tự nhiên lớn lên an lành khỏe mạnh."
      },
      {
        "year": 2010,
        "canChi": "Canh Dần",
        "age": "18 tuổi âm",
        "reading": "Năm nay ám hợp, việc học hành thi cử có lực trợ giúp ngầm, song cần chủ động thưa hỏi thầy cô bạn bè mới thấy rõ hiệu quả. Tự học và tích lũy thực lực âm thầm tất sẽ gặt hái thành tích cao."
      },
      {
        "year": 1998,
        "canChi": "Mậu Dần",
        "age": "30 tuổi âm",
        "reading": "Năm ám hợp, sự nghiệp dễ được quý nhân ngầm tác thành, song cơ hội không hiển lộ rõ, cần quan sát tinh tế. Chuyển việc hay học nâng cao đều nên kín tiếng, thời cơ chín muồi tự khắc nước chảy thành sông."
      },
      {
        "year": 1986,
        "canChi": "Bính Dần",
        "age": "42 tuổi âm",
        "reading": "Năm nay ám hợp, tài vận sự nghiệp lấy ổn định làm đầu, hợp tác ngầm hay dự án tay trái có thể mang lại thu nhập khá, song chớ nên khoe khoang. Xử lý chu toàn chi tiết thì cả năm căn cơ vững chắc."
      },
      {
        "year": 1974,
        "canChi": "Giáp Dần",
        "age": "54 tuổi âm",
        "reading": "Lưu niên ám hợp mang lại nhân mạch và nguồn lực trợ giúp ngầm, song hợp tác dễ sinh sóng ngầm, cần văn bản giấy trắng mực đen quy định rõ quyền hạn trách nhiệm. Tài chính lấy thủ làm an toàn."
      },
      {
        "year": 1962,
        "canChi": "Nhâm Dần",
        "age": "66 tuổi âm",
        "reading": "Tuổi xế chiều gặp ám hợp, quan hệ gia đình hòa thuận êm ấm. Sức khỏe nên âm thầm điều dưỡng, bệnh vặt khó tránh song không đáng ngại, giữ nếp nghỉ ngơi đều đặn thì thân tâm an lạc."
      },
      {
        "year": 1950,
        "canChi": "Canh Dần",
        "age": "78 tuổi âm",
        "reading": "Năm ám hợp được con cháu chăm lo chu đáo. Sức khỏe cần lưu ý huyết áp và bệnh khớp cũ, giữ tâm thái khoáng đạt, vận động nhẹ nhàng định kỳ thì an hưởng tuổi già."
      },
      {
        "year": 1938,
        "canChi": "Mậu Dần",
        "age": "90 tuổi âm",
        "reading": "Năm nay ám hợp, phúc khí ẩn trong từng chi tiết đời thường, tình thân gia đình sâu sắc gắn bó. Đề phòng trượt ngã và ăn uống khó tiêu, tâm cảnh thanh thản thì ngày đêm đều an lành."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Chính tài bình ổn, thiên tài chưa thấy khoản thu rõ nét. Tháng này Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên tốt lợi cho thương thảo, song thế ám hợp không nên công khai ngã giá, đàm phán riêng tư kín đáo dễ thành sự hơn. Kế hoạch đầu tư có thể thai nghén, việc triển khai nên quan sát thêm.",
        "career": "Khởi đầu năm mới, không khí công sở tương đối hòa hợp. Vận học tập nâng cao rất tốt, đăng ký khóa học hay thi lấy chứng chỉ đều đúng thời điểm, trang bị tri thức cho bản thân rất lợi cho cả năm.",
        "love": "Đào hoa tinh động, người độc thân nhân duyên khá tốt, song phần lớn là bạn bè xã giao thoáng qua. Người có bạn đời chung sống hòa hợp, song Nhâm Dần cùng bản mệnh phục ngâm, việc nhỏ dễ trồi sụt, bao dung là hơn.",
        "health": "Dịp tết nguyên đán ăn uống nên tiết chế, tỳ vị dạ dày khá nhạy cảm. Mộc khí vượng thịnh, chức năng gan mật cần chú ý, bớt thức khuya.",
        "dispute": "Nhân duyên tuy tốt song lời ăn tiếng nói vẫn cần chừa đường lui. Tháng này không nên làm người trung gian đứng giữa hòa giải kẻo chuốc hiểu lầm."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tượng động trung cầu tài, ra ngoài đàm phán hoặc nghiệp vụ nơi xa có bước tiến triển. Tháng này Tứ Lục Văn Khúc tinh nhập trung cung, chi phí sức khỏe có thể tăng, dự trù sẵn ngân sách dự phòng là thỏa đáng.",
        "career": "Dịch Mã tinh động, cơ hội công tác, điều động hay biệt phái xuất hiện. Tin rằng biến động mang lại cơ hội mới, song trong Mão Mùi bán hợp cũng có sóng ngầm, chi tiết hợp đồng cần xét duyệt kỹ càng.",
        "love": "Tháng tụ ít xa nhiều, người độc thân nhân duyên nơi xa khá tốt. Người có bạn đời nên tăng cường giao lưu trao đổi, khoảng cách ngược lại giúp thấu hiểu nhau hơn.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, chú ý sức khỏe. Hệ hô hấp và da dẻ mẫn cảm, thời điểm giao mùa cần giữ ấm, tránh đến nơi đông đúc không khí ngột ngạt.",
        "dispute": "Ra ngoài dễ gặp trục trặc nhỏ, lịch trình nên chừa khoảng thời gian co giãn. Tiếp xúc với người phương xa nên bao dung sự khác biệt văn hóa."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tài vận trồi sụt, chính tài tạm ổn, thiên tài không nên chạm vào. Tháng này Tam Bích Lộc Tồn tinh nhập trung cung, dễ chuốc khẩu thiệt, giao dịch tài chính cố gắng giấy trắng mực đen, lời hứa miệng dễ sinh biến quẻ.",
        "career": "Dư khí tam hình Thìn Tuất Sửu Mùi, nhân sự nơi làm việc khá phức tạp. Tháng này nên nói ít làm nhiều, tin rằng hành sự khiêm tốn có thể tránh được tranh chấp không đáng có, quyết định lớn nên tạm hoãn.",
        "love": "Tâm trạng dao động khá lớn, với bạn đời dễ vì việc nhỏ mà tranh cãi. Người độc thân không nên bắt đầu tình cảm mới trong tháng này, nhìn hoa trong sương khó phân thật giả.",
        "health": "Thổ Mộc giao chiến, chức năng tỳ vị dạ dày khá yếu, ăn uống thanh đạm là hợp. Áp lực cảm xúc dễ dẫn tới mất ngủ, vận động thích hợp giúp giải tỏa.",
        "dispute": "Tháng này Tam Bích thị phi tinh nhập trung cung, dễ chuốc khẩu thiệt. Bất luận ở công sở hay đời sống, cẩn ngôn thận hạnh là thượng sách, cuốn vào tranh chấp của người khác khó lòng dứt ra."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Thế tiền đến tiền đi, chính tài thu nhập ổn định song có chi tiêu đột xuất. Tháng này Nhị Hắc Cự Môn tinh nhập trung cung, lợi cho học tập thi cử, chi phí học hành nâng cao xem như đầu tư dài hạn.",
        "career": "Dần Tỵ tương hại, chốn công sở có tượng ngầm cản trở kiềm tỏa. Văn Xương tinh động, dùng thực lực chứng minh bản thân hiệu quả hơn tranh cãi đôi co, tin rằng thời gian sẽ trả lại sự công bằng.",
        "love": "Tháng tương hại, quan hệ nhân tế khá căng thẳng. Người có bạn đời dễ vì hiểu lầm mà sinh hiềm khích, chủ động giao tiếp mới hóa giải được. Người độc thân đào hoa ngầm chứa cạm bẫy, chớ vội tiến sâu.",
        "health": "Hỏa khí tăng dần, tim mạch và mắt cần chú ý. Nhị Hắc Cự Môn nhập trung, Bệnh Phù đương lệnh cần đặc biệt chú ý sức khỏe.",
        "dispute": "Tháng này thị phi sóng ngầm, tiểu nhân ẩn nấp trong bóng tối. Bất luận nghe thấy điều gì, trước khi xác minh chớ vội bày tỏ thái độ kẻo vô tình bị cuốn vào vòng xoáy."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Tháng này Nhất Bạch Tham Lang tinh nhập trung cung, mọi việc cẩn trọng. Tài vận bề ngoài thuận buồm xuôi gió song thực chất ngầm chứa sóng gợn, đầu tư lớn hay cho vay bảo lãnh nhất loạt không nên, giữ chặt chính tài là trên hết.",
        "career": "Ngọ Mùi lục hợp, Dần Ngọ bán hợp, nơi làm việc có quý nhân âm thầm nâng đỡ. Tháng này nên chủ động liên lạc người quen cũ, tin rằng mạng lưới quan hệ sẽ mang lại thời cơ bất ngờ; song Ngũ Hoàng đương lệnh, tranh công ồn ào dễ chuốc đố kỵ.",
        "love": "Tháng Đào Hoa nhân duyên chan hòa, người độc thân cơ hội hạnh ngộ khá nhiều. Người có bạn đời tình cảm thêm mặn nồng, song đào hoa xấu cũng xen lẫn, vạch rõ ranh giới thì không lo hậu họa.",
        "health": "Nhất Bạch Tham Lang nhập trung, nhân duyên đào hoa vượng nhưng cần tránh hoạt động nguy hiểm cao, người lái xe đặc biệt cần tập trung tinh thần, tháng Thổ nặng nề tỳ vị đường ruột cũng cần điều dưỡng.",
        "dispute": "Nhân duyên tuy tốt song dễ chuốc lấy sự chú ý không cần thiết. Tháng này không nên cố tình nổi bật, thái độ khiêm nhường có thể hóa giải sự thù địch tiềm tàng."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Tháng này Cửu Tử Hữu Bật tinh nhập trung cung, lợi cho tài vận. Chính tài có niềm vui thu nhập, thiên tài cũng có sóng ngầm, song tháng tương xung tiền đến rồi đi, thấy tốt thu tay mới là sáng suốt.",
        "career": "Sửu Mùi tương xung mang khí Tuế Phá, nơi làm việc biến động khá lớn. Tháng này Cửu Tử Hữu Bật tinh nhập trung lợi cho điều động quyền hạn chức trách, thuận thế mà làm có lợi hơn cưỡng lại biến hóa, chuẩn bị đường lui thì tiến thoái có căn cứ.",
        "love": "Tháng tương xung cảm xúc trồi sụt, với bạn đời dễ sinh ma sát. Người độc thân không nên đưa ra quyết định tình cảm trọng đại trong tháng này, bắt đầu do kích động dễ để lại hệ lụy.",
        "health": "Cửu Tử Hữu Bật tinh đương lệnh, hệ hô hấp cần lưu ý. Tháng tương xung áp lực tinh thần khá lớn, sinh hoạt điều độ là bí quyết dưỡng sinh.",
        "dispute": "Tháng này biến động dồn dập, thị phi theo đó mà sinh. Bất luận gặp chuyện gì hãy giữ phán đoán bình tĩnh, tin rằng sau cơn sóng gió tự có chuyển biến tốt đẹp."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này Bát Bạch Tả Phụ tinh nhập trung cung, phòng phá tài. Tài vận bình ổn nhưng có sóng ngầm, đầu cơ mạo hiểm không nên đụng vào, chi tiêu hàng ngày cũng cần thận trọng, nguy cơ thất lạc tài vật khá cao.",
        "career": "Không khí công sở dần đi vào hòa hoãn, những xáo trộn tháng trước đã dần ổn định. Tháng này nên chuyên tâm vào nghiệp vụ cốt lõi, làm việc chắc chắn sẽ được cấp trên âm thầm công nhận, không nên nóng vội thể hiện.",
        "love": "Đời sống tình cảm êm ả, là lúc tình cảm bền lâu như dòng nước mát. Người có bạn đời nên sắp xếp hoạt động chung thắt chặt sợi dây đồng điệu. Người độc thân duyên chưa tới, cưỡng cầu vô ích.",
        "health": "Bát Bạch Tả Phụ tinh nhập trung chủ về tổn thương bất ngờ, đi lại cẩn thận là trọng. Tháng Kim Mộc giao chiến, gân cốt và bệnh cũ dễ tái phát, trước khi vận động nhất thiết phải khởi động kỹ.",
        "dispute": "Tháng này thị phi giảm bớt, song Phá Quân tinh động, quan hệ nhân tế vẫn có sóng ngầm. Không phát sinh giao dịch tiền bạc với người khác thì có thể tránh được phần lớn phân tranh."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này Thất Xích Phá Quân tinh nhập trung cung, đại lợi tài vận. Cả chính tài lẫn thiên tài đều có cơ hội vào túi, thế trận bố trí nửa đầu năm dần đến kỳ thu hoạch, song vẫn cần kín đáo xử lý, thế ám hợp không nên phô trương.",
        "career": "Thất Xích Phá Quân đương lệnh, vận sự nghiệp vững bước đi lên. Nơi làm việc có quý nhân âm thầm chỉ điểm, tin rằng nắm bắt thời cơ tháng này mục tiêu cả năm có thể tiến gần thêm một bước lớn.",
        "love": "Vận tình cảm bình ổn đi lên, người có bạn đời quan hệ càng thêm thực tế gắn bó. Người độc thân qua trưởng bối giới thiệu duyên phận khá đáng tin cậy, hãy mở rộng lòng đón nhận.",
        "health": "Thổ Kim tương sinh, tỳ vị và hệ hô hấp tương đối điều hòa thuận lợi. Song tiết thu hanh khô dần rõ rệt, nhuận táo dưỡng phế là trọng điểm ăn uống.",
        "dispute": "Vận thế tháng này thuận buồm xuôi gió, thị phi tự nhiên giảm thiểu. Song Thất Xích nhập trung vẫn cần phòng ngừa tổn thất phá tài nhỏ."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Tháng này Lục Bạch Vũ Khúc tinh nhập trung cung, việc hỷ đào hoa. Tài vận gắn liền với sự kiện hỷ sự, có thể có chi tiêu cưới hỏi, sinh con; trù tính sớm thì không bị áp lực. Thiên tài không lợi, bài bạc cấm kỵ.",
        "career": "Dư khí tam hình Dần Tỵ Thân chưa tan, sóng ngầm công sở lại xuất hiện. Tháng này nên giữ không nên công, tin rằng ẩn nhẫn giấu mình có thể tránh được phong mang sắc nhọn, đợi tháng sau tam hợp hãy bứt phá.",
        "love": "Lục Bạch nhập trung có lợi cho thiên tài và địa vị, người có bạn đời thích hợp bàn chuyện hôn nhân cưới hỏi. Người độc thân đào hoa tuy nhiều nhưng cần phân biệt chân tình giả ý.",
        "health": "Hỏa Thổ khô nóng, da dẻ và tâm trạng tương đối bất ổn. Tháng tam hình tinh thần dễ căng thẳng, vận động điều độ giúp giải phóng ức chế.",
        "dispute": "Tháng này tam hình tinh động, đề phòng thị phi. Dù ở công sở hay giữa người thân bạn bè, nhắc lại chuyện cũ dễ sinh rắc rối, đôi khi giả vờ khờ khạo lại là trí tuệ lớn."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Tháng này Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên đào hoa. Thế tam hợp dẫn dắt tài vận, cơ hội hợp tác sinh tài xuất hiện, song năm ám hợp chi tiết hợp đồng phải thẩm định kỹ càng, anh em ruột thịt cũng phải rõ ràng minh bạch.",
        "career": "Hợi Mão Mùi tam hợp, Dần Hợi lục hợp, vận quý nhân công sở đạt đỉnh cao của cả năm. Tháng này nên chủ động mở rộng mạng lưới quan hệ, tin rằng thái độ chân thành sẽ đổi lấy sự trợ lực thực chất, cơ hội thăng tiến ngầm ẩn bên trong.",
        "love": "Ngũ Hoàng tinh động, nhân duyên chan hòa. Người độc thân cơ hội tao ngộ lương duyên rất cao, người có bạn đời tình cảm ngọt ngào thắm thiết, song cần phòng ngừa cám dỗ bên ngoài.",
        "health": "Thủy khí tăng vượng, thận và hệ tiết niệu cần lưu ý. Thời tiết chuyển lạnh, giữ ấm xương khớp là trọng, người lớn tuổi đặc biệt không thể xem nhẹ.",
        "dispute": "Tháng tam hợp quan hệ nhân tế hòa hợp. Song đào hoa quá vượng dễ chiêu mời đố kỵ, giao thiệp với người khác giới giữ khoảng cách chừng mực để tránh lời ong tiếng ve."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tháng này Tứ Lục Văn Khúc tinh nhập trung cung, chú ý sức khỏe. Tài vận vì sức khỏe hoặc chuyện của trưởng bối mà có thêm chi tiêu, dự trù ngân sách là thượng sách. Chính tài tạm ổn, không nên đầu tư mới.",
        "career": "Tý Mùi tương hại, nơi làm việc có trở ngại ngầm. Tháng này nên chuyên tâm vào việc mình phụ trách, tin rằng vững vàng từng bước hiệu quả hơn mạo hiểm, quan hệ nhân tế nên ra sức hàn gắn.",
        "love": "Tháng tương hại, tình cảm dễ có hiểu lầm. Người có bạn đời nên tăng cường sẻ chia trò chuyện, người độc thân không nên bắt đầu tình cảm mới trong tháng này, nhìn hoa trong sương khó có kết quả tốt.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, lưu tâm sức khỏe. Thủy hàn Thổ đông, chức năng tỳ vị dạ dày khá yếu, ăn uống ấm nóng là hợp. Sức khỏe người lớn tuổi nên quan tâm nhiều hơn.",
        "dispute": "Tháng Hại Thái Tuế thị phi sóng ngầm. Bất luận nghe thấy tin tức gì, trước khi thẩm tra không nên lan truyền kẻo vô tình bị cuốn vào tranh chấp."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tháng này Tam Bích Lộc Tồn tinh nhập trung cung, phòng ngừa khẩu thiệt thị phi. Sửu Mùi tương xung mang khí Tuế Phá, tài vận dao động khá lớn, quyết toán cuối năm nên kiểm tra cẩn thận từng chi tiết, sót lỗi dễ tổn thất tiền bạc.",
        "career": "Tháng Tuế Phá biến động công sở khó tránh. Tháng này nên hoàn thành các công việc tồn đọng trong tay, kế hoạch mới để sang năm sau tiết Lập Xuân hãy bàn, thuận thế mà làm sáng suốt hơn nghịch thế đối kháng.",
        "love": "Tháng tương xung cảm xúc bất ổn, với bạn đời dễ sinh cãi cọ. Tiếp khách cuối năm bề bộn, ranh giới xã giao nên rõ ràng để tránh hiểu lầm vô cớ.",
        "health": "Tam Bích thị phi tinh nhập trung cung, áp lực tâm lý khá lớn. Tháng Tuế Phá dễ có va chạm bất ngờ, lái xe và đi lại cần hết sức cẩn thận, tiệc tùng cuối năm tuyệt đối không uống rượu quá độ.",
        "dispute": "Tam Bích thị phi kết hợp tháng Tuế Phá, chuyện cũ dễ lặp lại trồi sụt. Không dính líu tiền bạc với ai, ăn tết khiêm nhường kín đáo thì bình an trọn vẹn."
      }
    ],
    "yearSummary": "Năm Đinh Mùi đối với người tuổi Dần là một năm 'Ám Hợp Quý Nhân, tích lũy nội lực'. Có các cát tinh lớn Thiên Đức, Phúc Tinh, Bát Tọa soi đường, mọi hiểm nguy trắc trở đều có thể hóa giải êm thấm. Chỉ cần bạn giữ tác phong làm việc thực chất, không khoe khoang phô trương, quản lý tài chính chặt chẽ thì sự nghiệp và tài lộc sẽ từng bước thăng hoa vững bền."
  },
  "Mão": {
    "name": "Mão (Mèo / Thỏ)",
    "chinese": "兔",
    "english": "Rabbit",
    "icon": "🐰",
    "relation": "Tam Hợp Quý Nhân",
    "relationBadge": "he",
    "themeYear": "Tam Hợp Quý Nhân • Vận Khí Hanh Thông",
    "auspiciousStars": [
      "Tam Hợp",
      "Thiên Đức Quý Nhân",
      "Tướng Tinh"
    ],
    "inauspiciousStars": [
      "Bạch Hổ",
      "Phi Liêm",
      "Đại Sát"
    ],
    "overview": "Người tuổi Mão năm nay là **Năm Tam Hợp Quý Nhân**. Địa chi lưu niên Mùi Thổ cùng Mão Mèo bán hợp, cấu thành thế Hợi Mão Mùi tam hợp Mộc cục. Tuy chưa phải là toàn hợp, song lực trợ giúp của quý nhân đã hiển lộ rõ ràng, đặc biệt là duyên phận với trưởng bối, cấp trên rất tốt, gặp chuyện dễ được nâng đỡ chỉ điểm. Năm nay không phải năm xung phạm Thái Tuế, xu thế tổng thể bình ổn đi lên, bất luận sự nghiệp hay quan hệ xã giao đều có thể mượn thế tam hợp thuận thế mà làm, hoa thơm trái ngọt đều có thể kỳ vọng.",
    "starsAnalysis": "Năm nay có cục diện Tam Hợp tương trợ, mang lại nguồn năng lượng quý nhân dồi dào, gặp hung hóa cát, các dự án hợp tác đều diễn ra thuận lợi êm thấm. Tuy nhiên trong năm cần lưu ý các hung tinh nhỏ như **Bạch Hổ**, **Phi Liêm**, **Đại Sát**: Bạch Hổ cảnh báo dễ có va chạm xây xát nhỏ hoặc tranh cãi phát sinh đột ngột, khi tham gia giao thông hay vận động thể thao cần cẩn trọng; Phi Liêm nhắc nhở đề phòng tiểu nhân đố kỵ sau lưng; Đại Sát khuyên bạn nên quản lý tài chính chặt chẽ, không nên vung tay quá trán trong các cuộc vui chơi giải trí.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ khô nóng, lại có Mão Mộc sinh Hỏa, là cơ hội tuyệt vời để người Hàn Mệnh phát huy tối đa năng lực sở trường. Hãy mạnh dạn đón nhận các trọng trách mới hoặc mở rộng hoạt động kinh doanh, tài lộc sẽ đổ về như ý.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Hỏa Thổ vượng của năm có phần hơi khô táo đối với người Nhiệt Mệnh. Cần giữ tâm thái điềm tĩnh, chú ý bổ sung yếu tố Thủy trong môi trường sống và trang phục (màu đen, xanh lam, trắng, xám) để cân bằng sinh khí.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Vận khí duy trì ở mức cân bằng vững chắc, tiến thoái có căn cứ, kiên trì theo đuổi mục tiêu đã vạch sẵn thì sẽ thu hái thành quả xứng đáng.",
    "birthYears": [
      {
        "year": 2023,
        "canChi": "Quý Mão",
        "age": "5 tuổi âm",
        "reading": "Năm nay tam hợp đem lại lực trợ giúp bình ổn cho sự trưởng thành, gia trạch hòa thuận. Độ tuổi còn thơ ấu, ăn uống sinh hoạt vẫn cần chăm sóc chu đáo, sức khỏe tự nhiên phát triển vững chắc."
      },
      {
        "year": 2011,
        "canChi": "Tân Mão",
        "age": "17 tuổi âm",
        "reading": "Đang độ tuổi học hành, năm tam hợp vận quý nhân tốt, thầy cô bạn bè đều vui vẻ giúp đỡ. Thành tích học tập đòi hỏi tiến bước tuần tự, bất luận thi cử thế nào đều giữ tâm bình thản thì công hiệu gấp đôi."
      },
      {
        "year": 1999,
        "canChi": "Kỷ Mão",
        "age": "29 tuổi âm",
        "reading": "Năm mới bước vào đời hoặc học nâng cao, từ trường tam hợp giúp hòa nhập môi trường mới, dễ được tiền bối chỉ bảo. Chuyển việc hay không nên chọn theo sở thích, cần cù cày xới trong năm tự có đền đáp."
      },
      {
        "year": 1987,
        "canChi": "Đinh Mão",
        "age": "41 tuổi âm",
        "reading": "Vận sự nghiệp vững vàng đi lên, năm tam hợp cơ hội hợp tác dồi dào, mạng lưới quan hệ thêm thông suốt. Tài vận nên thủ không nên nóng vội, bất luận đầu tư hay chi tiêu lượng sức mà làm thì thong dong ứng đối."
      },
      {
        "year": 1975,
        "canChi": "Ất Mão",
        "age": "53 tuổi âm",
        "reading": "Năm nay quý nhân sự nghiệp rõ nét, đặc biệt có lợi cho mở rộng nghiệp vụ hoặc tranh thủ thăng tiến. Gia đình và công việc cùng gánh vác khó tránh hao tâm tổn trí, thu xếp thỏa đáng ắt tài đinh lưỡng vượng."
      },
      {
        "year": 1963,
        "canChi": "Quý Mão",
        "age": "65 tuổi âm",
        "reading": "Năm tam hợp, vận sức khỏe đại thể bình ổn, bệnh cũ có trồi sụt song không cản trở đại cục. Quan hệ gia đình hòa thuận, con cháu mang lại nhiều tin vui, sinh hoạt tiếp khách lấy chừng mực làm hay."
      },
      {
        "year": 1951,
        "canChi": "Tân Mão",
        "age": "77 tuổi âm",
        "reading": "Vận xế chiều an thái, lực trợ tam hợp khiến sum họp gia đình thường xuyên, không khí chan hòa. Huyết áp và xương khớp vẫn cần định kỳ kiểm tra, giữ tâm cảnh cởi mở thì phúc trạch dài lâu."
      },
      {
        "year": 1939,
        "canChi": "Kỷ Mão",
        "age": "89 tuổi âm",
        "reading": "Tuổi thọ cao niên, khí trường năm tam hợp ôn hòa, người nhà quan tâm chu đáo. Đi đứng nên thong thả không vội vã, bất luận trong nhà hay ngoài trời đều chú ý mặt đường, bình an là phúc."
      },
      {
        "year": 1927,
        "canChi": "Đinh Mão",
        "age": "101 tuổi âm",
        "reading": "Tuổi thọ bách niên giai lão, năm nay lấy tĩnh dưỡng làm trọng, thế tam hợp khiến trạng thái tinh thần còn tốt. Ăn uống nên chia nhiều bữa nhỏ, người nhà chăm sóc chu đáo tự hưởng tuổi già an lạc."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Chính tài bình ổn, thiên tài không nên manh động. Tháng này Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên mang lại tài lộc, thương thảo dễ đạt đồng thuận, song kế hoạch đầu tư mới nên đánh giá chi tiết, không thể dựa vào bốc đồng nhất thời.",
        "career": "Đầu óc thông suốt, lợi cho học tập thi chứng chỉ hoặc trù hoạch dự án mới. Quan hệ nhân tế nơi công sở hòa hợp, cấp trên có ấn tượng tốt về bạn, chủ động thể hiện sẽ nhận được nhiều cơ hội hơn.",
        "love": "Đào hoa tinh động, người độc thân xã giao sôi nổi, dễ gặp đối tượng hợp ý; người có bạn đời nên tăng cường trò chuyện, tránh vì bận rộn mà lạnh nhạt đối phương.",
        "health": "Đầu xuân còn rét, chú ý đường hô hấp khó chịu. Sinh hoạt điều độ thì tinh thần tràn trề, không nên thức khuya tổn hại tâm thần.",
        "dispute": "Nhân duyên tốt thì thị phi ít, song nói nhiều tất hớ, tán gẫu chớ bàn chuyện sai trái của người khác để tránh phiền toái vô cớ."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Động trung cầu tài, ra ngoài thương thảo hoặc hợp tác phương xa có thu hoạch. Tháng này Tứ Lục Văn Khúc tinh nhập trung cung, phá tài hóa giải tai ách, quyên góp thiện nguyện hay khám sức khỏe đều là chi tiêu hữu ích.",
        "career": "Cơ hội biến động công việc nổi lên, chuyển chức, biệt phái hoặc đi công tác thường xuyên. Dịch Mã chưa hẳn là xấu, chủ động tranh thủ sẽ khai phá lĩnh vực mới.",
        "love": "Tụ ít xa nhiều, người yêu xa cần liên lạc nhiều hơn; người độc thân trên đường lữ hành hoặc công tác dễ có duyên tao ngộ, song tình duyên ngắn ngủi không nên cưỡng cầu.",
        "health": "Bệnh Phù tinh chiếu, đường ruột nhạy cảm, vệ sinh ăn uống cần chú ý. Đi lại xe cộ mệt mỏi nên nghỉ ngơi đầy đủ để sức đề kháng tự nhiên nâng cao.",
        "dispute": "Trong lúc bôn ba dễ có hiểu lầm, việc quan trọng lưu lại văn bản ghi chép, lời nói gió bay thì sau này khó giải quyết."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tài vận trồi sụt, chính tài tạm ổn, thiên tài chớ đụng. Tháng này Tam Bích Lộc Tồn tinh nhập trung cung, chuyện vì tiền mà mất nghĩa khí phải đề phòng, cho vay mượn bảo lãnh nhất loạt từ chối.",
        "career": "Thìn Mão tương hại, công sở sóng ngầm, cạnh tranh đồng nghiệp gay gắt. Làm việc khiêm tốn, không cuốn vào tranh giành phe phái thì hình hại tự giảm bớt.",
        "love": "Tâm trạng chịu áp lực, dễ ma sát với bạn đời. Việc nhỏ chớ cố chấp, lùi một bước biển rộng trời cao; người độc thân đào hoa đới kiếp, người mới quen nên quan sát kỹ.",
        "health": "Can khí không thông, dễ đau đầu mất ngủ. Đi dạo ngoài trời nhiều hơn để giải tỏa u uất, thân tâm sẽ lấy lại cân bằng.",
        "dispute": "Tam hình kết hợp Tam Bích, khẩu thiệt thị phi khó tránh. Nói ít làm nhiều, tránh xa vòng tròn buôn chuyện, tin rằng cây ngay không sợ chết đứng."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Tiền đến tiền đi, dễ có chi tiêu ngoài ý muốn. Tháng này Nhị Hắc Cự Môn tinh nhập trung cung, đầu tư văn hóa nghệ thuật có thể có thu hoạch, song cần phán đoán chuyên nghiệp, không nên hùa theo trào lưu.",
        "career": "Tỵ Mão tương hại, hợp tác dễ sinh bất đồng. Giấy tờ hợp đồng sửa đổi nhiều lần, kiên nhẫn xử lý ắt thành sự, nóng vội thì hỏng việc.",
        "love": "Tương hại chủ về hiểu lầm, lòng tin giữa đôi lứa bị thử thách. Thẳng thắn sẻ chia có thể cởi mở nút thắt; người độc thân kết bạn trên mạng cần kiểm tra kỹ lai lịch đối phương.",
        "health": "Hỏa khí tăng dần, chú ý mắt và tim mạch. Ăn uống thanh đạm, uống nhiều nước để thanh lọc hỏa độc.",
        "dispute": "Súng sáng dễ đỡ, tên ngầm khó phòng. Tháng này không nên đứng làm người trung gian kẻo hai đầu chịu oán."
      },
      {
        "month": "Tháng Năm (Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Ngọ Mão tương phá, tài vận bề ngoài rực rỡ nhưng bên trong hao tổn ngầm. Tháng này Nhất Bạch Tham Lang tinh nhập trung cung, đầu tư lớn tạm hoãn, giữ gìn là thượng sách, chi tiêu nhỏ không sao.",
        "career": "Lục Hợp chủ quý nhân, chốn công sở được đồng nghiệp phối hợp, dự án xúc tiến thuận lợi. Song Ngũ Hoàng đương lệnh, quyết định trọng đại nên hỏi ý kiến trưởng bối, không thể độc đoán.",
        "love": "Tháng Đào Hoa vượng nhất, người độc thân duyên khác phái cực tốt, song đào hoa xấu cũng lẫn lộn, không nên vội vã cưới gấp; người có bạn đời tình cảm thêm mặn nồng, thích hợp đính hôn cưới hỏi.",
        "health": "Hỏa viêm Thổ táo, tâm trạng dễ nóng nảy, chú ý huyết áp. Bơi lội hay hoạt động dưới nước giúp cân bằng hỏa khí, song an toàn là trên hết.",
        "dispute": "Nhân duyên tốt thì thị phi tránh xa, song đào hoa quá thịnh dễ chuốc đố kỵ, lời ăn tiếng nói đoan chính thì không lo hậu họa."
      },
      {
        "month": "Tháng Sáu (Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Xung tất động, động tất có tài, tài vận phương xa khá tốt. Tháng này Cửu Tử Hữu Bật tinh nhập trung cung, thiên tài tinh động, lướt sóng ngắn hạn có thể có thu hoạch, thấy tốt thu tay.",
        "career": "Tháng biến động, điều chỉnh vị trí hay tái cơ cấu công ty lộ diện. Chủ động cầu biến thắng hơn bị động chờ đợi, song môi trường mới cần thời gian thích ứng, không nên nóng vội.",
        "love": "Tháng xung cảm xúc dao động, bạn đời dễ có tranh cãi. Tạm thời tách ra bình tâm hoặc cùng nhau đi du lịch đều hóa giải căng thẳng; người độc thân không nên định tình tháng này.",
        "health": "Mùi Thổ đương lệnh, tỳ vị dạ dày chịu tải nặng, ăn uống tiết chế. Cửu Tử nhập trung, chú ý rèn luyện thể thao vừa sức để nâng cao thể lực.",
        "dispute": "Tương xung chủ sự biến động, trong biến động dễ có khẩu thiệt. Ít hứa hẹn, quan sát nhiều, việc chậm mà chắc."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Chính tài ổn định, thiên tài bình lặng. Tháng này Bát Bạch Tả Phụ tinh nhập trung cung, phòng ngừa trộm cắp lừa đảo, giao dịch mạng phải xác minh danh tính đối phương để tránh mất tiền oan.",
        "career": "Vận thế hồi phục bình ổn, nỗ lực trước đó dần thấy thành quả. Thất Xích chủ sự cải cách, xu thế ngành nghề có thể chuyển hướng, giữ sự nhạy bén sẽ nắm bắt tiên cơ.",
        "love": "Bình lặng là chân thật, đôi lứa thấu hiểu ăn ý, thích hợp với cuộc sống gia đình thường nhật; người độc thân duyên chưa tới cưỡng cầu vô ích, hãy bồi dưỡng bản thân.",
        "health": "Kim vượng khắc Mộc, chú ý gân cốt và hệ thần kinh. Dân văn phòng nên định kỳ vươn vai vận động phòng ngừa thoái hóa đốt sống cổ.",
        "dispute": "Tháng bình ổn thị phi hiếm hoi, song Thất Xích chủ đao quang, tránh tranh chấp xô xát với người khác, lùi một bước trời cao biển rộng."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này Thất Xích Phá Quân tinh nhập trung cung, đại lợi tài vận, là tháng vượng tài nhất trong năm. Cả chính tài lẫn thiên tài đều vào túi, kế hoạch ấp ủ bấy lâu có thể đem ra thực thi.",
        "career": "Quý nhân đề bạt, cơ hội tăng lương thăng chức xuất hiện. Hãy nắm bắt thời cơ thể hiện thực lực, song chớ kiêu căng ngạo mạn, khiêm tốn thì đường đi càng rộng mở.",
        "love": "Dậu Mão tương xung ngầm, người có bạn đời chú ý thấu hiểu nhường nhịn; người độc thân có cơ hội tiếp xúc đối tượng qua môi trường công việc.",
        "health": "Khí thu hanh táo, chú ý bảo vệ phổi và đường hô hấp, uống nhiều nước, ăn nhiều hoa quả dưỡng âm.",
        "dispute": "Vận may đang lên cần giữ tác phong kín kẽ khiêm nhường, thành công không khoe khoang để tránh chuốc lấy đố kỵ ghen ghét."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Tài vận hồi lạc, chi tiêu gia tăng. Tháng này Lục Bạch Vũ Khúc tinh nhập trung cung, hỷ sự hao tài, quan hệ ngoại giao quà cáp nên có ngân sách, chớ vung tay quá trán.",
        "career": "Tuất Mão tương hình, nhân tế công sở căng thẳng, cấp dưới hoặc người đi sau có thể không phục. Lấy nhu khắc cương, lấy đức phục người thì hình khắc tiêu tan trong vô hình.",
        "love": "Lục Bạch Vũ Khúc nhập trung mang lại vị thế tốt, người có bạn đời nên cân bằng giữa công việc và gia đình.",
        "health": "Tháng hình áp lực lớn, chú ý mất ngủ và hệ tiêu hóa. Vận động thích hợp giúp tinh thần thư thái.",
        "dispute": "Tam hình trùng điệp, tháng này là đỉnh điểm thị phi trong cả năm. Nói ít làm nhiều, tránh xa ranh giới pháp lý, bình an là phúc trọn vẹn."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Hợi Mão Mùi tam hợp, tài vận hồi phục ổn định, cơ hội hợp tác sinh tài xuất hiện. Tháng này Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên mang lại tài lộc, khách hàng cũ giới thiệu khách mới.",
        "career": "Tháng tam hợp quý nhân, đồng đội hợp tác ăn ý, dự án sự bán công bội. Thích hợp mở rộng mạng lưới quan hệ, tham gia sự kiện ngành nghề sẽ thấy cơ hội ở khắp nơi.",
        "love": "Ngũ Hoàng tái hiện, người độc thân hoạt động xã giao sôi nổi, dễ gặp đối tượng xứng đôi vừa lứa; người có bạn đời hòa thuận êm ấm, thích hợp cùng nhau đi du lịch.",
        "health": "Tháng Thủy vượng, chú ý thận và hệ tiết niệu. Giữ ấm là trọng yếu, đặc biệt là vùng eo lưng đầu gối để hàn khí không xâm nhập.",
        "dispute": "Tháng tam hợp lấy nhân hòa làm quý. Chủ động quan tâm đồng nghiệp bạn bè, tích lũy ân tình thì sau này gặp chuyện tự có người giúp."
      },
      {
        "month": "Tháng Mười Một (Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tý Mão tương hại, tài vận sóng ngầm, bề ngoài phong quang song thực tế có nỗi lo ngầm. Tháng này Tứ Lục Văn Khúc tinh nhập trung cung, chi phí y tế tăng lên, nên mua bảo hiểm dự phòng khi cần.",
        "career": "Tháng hại chủ sự ám hại ngầm, tiểu nhân công sở hoạt động, công lao dễ bị tranh đoạt. Lưu giữ nhật ký công việc, sao lưu email quan trọng để có bằng chứng rõ ràng.",
        "love": "Tương hại chủ hiểu lầm, lòng tin giữa đôi lứa bị thử thách. Tránh thử thách ngờ vực, thẳng thắn thì vết nứt được hàn gắn; người độc thân không nên bắt đầu tình cảm mới.",
        "health": "Bệnh Phù tinh chiếu, chú ý bệnh cũ tái phát. Khám sức khỏe định kỳ, bệnh nhẹ chớ kéo dài để ngăn ngừa bệnh nặng.",
        "dispute": "Tháng hại thị phi quấn thân, lời ong tiếng ve khó tránh. Không tranh biện, không phản kích, tin rằng thời gian sẽ chứng minh tất cả, chuyên tâm vào việc mình là hơn."
      },
      {
        "month": "Tháng Chạp (Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Sửu Mùi tương xung, tháng Tuế Phá, tài vận chao đảo. Tháng này Tam Bích Lộc Tồn tinh nhập trung cung, không nên đưa ra quyết định tài chính trọng đại, tiền thưởng cuối năm nên tích lũy không nên tiêu xài hoang phí.",
        "career": "Cuối năm biến động, công ty điều chỉnh tổ chức hoặc nhân sự luân chuyển. Tháng xung chủ sự biến hóa, biến hóa chưa hẳn là xấu, giữ sự linh hoạt thì thuận thế mà làm.",
        "love": "Tháng Tuế Phá tâm trạng bất ổn, đôi lứa dễ vì việc thu xếp ngày tết mà cãi cọ. Nhường nhịn bao dung lẫn nhau; người độc thân người thân mai mối có thể gặp mặt nhưng chớ vội vàng.",
        "health": "Tiếp khách cuối năm dày đặc, chú ý gánh nặng gan dạ dày. Uống rượu vừa độ, ngủ sớm dậy sớm thì đón năm mới với trạng thái tràn đầy sinh lực.",
        "dispute": "Tuế Phá chồng thêm Tam Bích, cửa ải cuối cùng của năm thị phi khó tránh. Tránh cho vay tiền, không bảo lãnh cho ai, bình an đón tết, tĩnh đợi vận thế năm tới khởi sắc hanh thông."
      }
    ],
    "yearSummary": "Người tuổi Mão năm Đinh Mùi được thế Tam Hợp Mộc cục che chở, vận khí tổng thể bình ổn và thuận lợi vượt bậc. Dù trải qua các tháng hình hại nhỏ, song quý nhân luôn tề tựu gỡ rối đúng lúc. Cứ vững tâm tiến bước, dĩ hòa vi quý, chăm lo sự nghiệp và tích lũy tri thức, bạn sẽ gặt hái một năm bội thu cả về danh tiếng lẫn tài lộc."
  },
  "Thìn": {
    "name": "Thìn (Rồng)",
    "chinese": "龍",
    "english": "Dragon",
    "icon": "🐲",
    "relation": "Bình Hòa",
    "relationBadge": "normal",
    "themeYear": "Tử Vi Long Đức • Biến Động Tìm Cơ",
    "auspiciousStars": [
      "Tử Vi",
      "Long Đức",
      "Ngọc Đường"
    ],
    "inauspiciousStars": [
      "Bạo Bại",
      "Thiên Ách",
      "Lục Hại"
    ],
    "overview": "Người tuổi Thìn năm Đinh Mùi 2027 bước vào năm vận thế bình hòa, không xung không phạm Thái Tuế. Đặc biệt lại được bộ sao tôn quý bậc nhất Tử Vi và Long Đức đồng lâm chiếu mệnh. Tử Vi chủ về quý nhân đề bạt nâng đỡ, Long Đức có khả năng hóa giải nguy nan thành an lành, Ngọc Đường giúp danh tiếng và địa vị chuyên môn được tôn vinh. Tuy vậy, hung tinh Bạo Bại và Thiên Ách cảnh báo những tổn hao tài chính bất ngờ và nguy cơ tai nạn dọc đường. Phương châm tối ưu cho tuổi Thìn là 'mượn thế quý nhân, cẩn trọng chi tiêu, làm việc chu toàn'.",
    "starsAnalysis": "Cát tinh có **Tử Vi**, **Long Đức**, **Ngọc Đường**: Đây là tổ hợp cát tinh có uy lực mạnh mẽ nhất, đem lại cơ hội thăng tiến vượt bậc và sự bảo bọc vững chắc trong sự nghiệp. Hung tinh có **Bạo Bại**, **Thiên Ách**, **Lục Hại**: Bạo Bại khiến dòng tiền có lúc tụ tán bất ngờ, kỵ dốc toàn bộ vốn vào một phi vụ mạo hiểm; Thiên Ách nhắc nhở an toàn khi di chuyển và rèn luyện thể thao; Lục Hại gây ra những hiểu lầm nho nhỏ trong quan hệ bạn bè đối tác, cần minh bạch sổ sách tài chính.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ khô nóng là năm đại cát để Hàn Mệnh bứt phá, tận dụng tối đa năng lượng ấm áp của năm để triển khai các dự án quy mô lớn, tài lộc thu về rất dồi dào.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Năm Hỏa Thổ quá táo nhiệt dễ khiến Nhiệt Mệnh bồn chồn, làm việc vội vàng. Hãy bổ sung yếu tố Thủy (hướng Tây Bắc, màu đen, lam, trắng, xám) để làm dịu tâm trí, dĩ tĩnh chế động.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Duy trì sự ổn định, tận dụng sự hỗ trợ của sao Tử Vi để trau dồi chuyên môn, thi cử thăng chức đều rất thuận lợi.",
    "birthYears": [
      {
        "year": 2024,
        "canChi": "Giáp Thìn",
        "age": "4 tuổi âm",
        "reading": "Tuổi nhỏ được trưởng bối yêu thương chu đáo, môi trường sống êm đềm, chú ý giữ gìn hệ tiêu hóa và ăn uống vệ sinh sạch sẽ."
      },
      {
        "year": 2012,
        "canChi": "Nhâm Thìn",
        "age": "16 tuổi âm",
        "reading": "Giai đoạn học hành thi cử có Văn Xương và Ngọc Đường trợ lực, trí tuệ mẫn tiệp tiếp thu nhanh, cần chuyên tâm ôn luyện để đạt kết quả xuất sắc."
      },
      {
        "year": 2000,
        "canChi": "Canh Thìn",
        "age": "28 tuổi âm",
        "reading": "Độ tuổi sung sức lập thân, có quý nhân Tử Vi soi đường mở lối, hãy tự tin nhận lãnh trọng trách mới để bứt phá công danh."
      },
      {
        "year": 1988,
        "canChi": "Mậu Thìn",
        "age": "40 tuổi âm",
        "reading": "Sự nghiệp bước vào giai đoạn thăng hoa chín muồi, tài lộc dồi dào, cần phân bổ tài sản thông minh tránh đầu cơ mạo hiểm do ảnh hưởng của Bạo Bại."
      },
      {
        "year": 1976,
        "canChi": "Bính Thìn",
        "age": "52 tuổi âm",
        "reading": "Vị thế xã hội và uy tín ngành nghề được củng cố vững chắc, gia đạo êm ấm thuận hòa, chuẩn bị chu đáo kế hoạch kế thừa."
      },
      {
        "year": 1964,
        "canChi": "Giáp Thìn",
        "age": "64 tuổi âm",
        "reading": "Tuổi hoa giáp an nhàn, con cháu thành đạt hiếu thảo, chú ý kiểm tra định kỳ huyết áp và tim mạch, sinh hoạt điều độ."
      },
      {
        "year": 1952,
        "canChi": "Nhâm Thìn",
        "age": "76 tuổi âm",
        "reading": "An hưởng phúc thọ, tâm tính thanh thản, giữ ấm cơ thể trong mùa đông và duy trì đi bộ nhẹ nhàng hàng ngày."
      },
      {
        "year": 1940,
        "canChi": "Canh Thìn",
        "age": "88 tuổi âm",
        "reading": "Đại thọ diên niên, gia tộc hưng vượng ấm áp tình thân, tinh thần an nhiên tự tại trường thọ."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên dẫn dắt tài lộ, đàm phán hợp tác tương đối thuận lợi. Song tháng này vẫn thuộc kỳ quy hoạch, đầu tư số tiền lớn nên quan sát thêm để tránh phán đoán lệch lạc.",
        "career": "Khởi đầu năm mới suy nghĩ thông suốt, thích hợp lập kế hoạch cho cả năm. Chốn công sở có quý nhân ngầm trợ giúp, có cơ hội học tập nâng cao rất tốt, nên chủ động tranh thủ.",
        "love": "Đào hoa tinh vượng, người độc thân hoạt động xã giao dày đặc, cơ hội quen biết người khác phái tăng lên. Người có bạn đời nên dành nhiều thời gian bên nhau, tránh vì bận rộn mà sinh xa cách.",
        "health": "Đầu xuân hàn ẩm chưa tan, chú ý điều dưỡng tỳ vị. Ăn uống điều độ đúng giờ thì tinh thần luôn sung mãn.",
        "dispute": "Nhân duyên tuy tốt song nói nhiều tất hớ, trò chuyện với người mới quen giữ lại ba phần. Bất luận thân sơ, giao dịch tài chính phải rõ ràng minh bạch."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tượng động trung cầu tài, nghiệp vụ nơi xa hoặc đi công tác có thu hoạch thêm. Song bôn ba hao tổn cũng nhiều, nên làm tốt dự toán để không bị thu không bù nổi chi.",
        "career": "Công việc có cơ hội biệt phái, điều động hoặc dự án ngắn hạn, chủ động xuất kích sẽ thấy thành quả. Song Tứ Lục Văn Khúc tinh nhập trung cung, lịch trình gấp gáp cần chừa không gian nghỉ ngơi.",
        "love": "Tháng tụ ít xa nhiều, người độc thân tình duyên nơi xa khá vượng. Người có bạn đời nên duy trì liên lạc viễn thông, tránh vì khoảng cách nảy sinh hiểu lầm.",
        "health": "Bệnh Phù tinh chiếu, mệt mỏi xe cộ dễ kiệt sức. Chú ý đường hô hấp và dị ứng da, đi sớm về sớm là thỏa đáng.",
        "dispute": "Thân ở nơi xa, ít bận tâm chuyện thị phi bản địa. Dù nghe thấy tin đồn gì, mỉm cười cho qua sẽ tránh bị cuốn vào vòng xoáy."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tam Bích Lộc Tồn tinh nhập trung cung, tài vận dao động khá lớn, không nên tiến hành đầu tư trọng đại hoặc cho vay bảo lãnh. Chính tài tạm vững, thiên tài không nên cưỡng cầu.",
        "career": "Thìn Thìn tự hình, chốn công sở dễ vì vấn đề chi tiết mà nảy sinh ma sát với đồng nghiệp. Nên hành sự khiêm tốn, văn bản hợp đồng đối chiếu nhiều lần để giảm thiểu sai sót.",
        "love": "Tâm trạng khá trồi sụt thất thường, ở bên bạn đời dễ nảy sinh tranh cãi vô cớ. Người độc thân đào hoa ảm đạm, không nên vội vàng bước vào mối quan hệ mới.",
        "health": "Tháng hình khắc, bệnh cũ dễ tái phát. Chú ý gan mật và hệ thần kinh, sinh hoạt điều độ, tránh thức khuya.",
        "dispute": "Tháng này là đỉnh điểm thị phi của cả năm, tranh chấp khẩu thiệt đặc biệt nhiều. Bất kể thái độ đối phương ra sao, nhẫn nhịn ba phần sẽ biến việc lớn thành nhỏ."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Nhị Hắc Cự Môn tinh nhập trung cung, cơ hội biến tri thức chuyên môn thành tiền tệ gia tăng. Thi cử lấy chứng chỉ, nâng cao kỹ năng kỳ vọng mang lại tài vận, song thấy lợi chớ tham.",
        "career": "Văn Xương trợ vượng, vận học tập thi cử tốt, thi nâng ngạch chuyên môn dễ dàng vượt qua. Công sở có tiểu nhân ngầm hại, việc quan trọng lưu lại chứng từ văn bản.",
        "love": "Tháng tương hại, tình cảm dễ sinh sóng ngầm. Người có bạn đời nên thẳng thắn trao đổi, tránh ngờ vực. Người độc thân nên quan sát rõ ràng lai lịch đối phương.",
        "health": "Hỏa khí tăng dần, chú ý mắt và sức khỏe tim mạch. Ăn uống thanh đạm, uống nhiều nước để cân bằng nhiệt lượng trong người.",
        "dispute": "Ám hại chi tinh nổi lên, lòng phòng người không thể thiếu. Bất kể đồng nghiệp thân thiết đến đâu, cơ mật công việc chớ tùy tiện tiết lộ."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Nhất Bạch Tham Lang tinh nhập trung cung, chính tài tạm ổn, thiên tài đại kỵ. Lực lục hợp có lợi cho hợp tác sinh tài, song chọn đối tác phải thận trọng thì mới cùng hưởng thành quả.",
        "career": "Nhân duyên công sở hòa hợp, hợp tác nhóm thông suốt, dự án thúc đẩy tương đối thuận lợi. Song Ngũ Hoàng đương lệnh, quyết định trọng đại dời sang tháng sau, tháng này lấy phối hợp làm chính.",
        "love": "Tháng Đào Hoa vô cùng rực rỡ, người độc thân có hy vọng tìm được đối tượng vừa ý, phát triển nhanh chóng. Người có bạn đời tình cảm thăng hoa, có thể tính chuyện tương lai.",
        "health": "Ngũ Hoàng chủ tai bệnh, đi lại chú ý an toàn, tránh hoạt động nguy hiểm cao. Cảm xúc dễ vì đào hoa mà dao động, giữ tâm bình thản là cốt lõi.",
        "dispute": "Đào hoa quá vượng ngược lại chuốc lòng đố kỵ, giao thiệp với người khác giới giữ khoảng cách thích hợp. Dù đối phương chủ động hay không, ranh giới ứng xử nên chặt chẽ."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Cửu Tử Hữu Bật tinh nhập trung cung, vốn lợi tài vận song tháng tương xung tiền đến rồi đi. Chính tài giữ được, hoạt động đầu cơ nhất loạt không nên, tiền mặt là vua.",
        "career": "Điềm báo biến động công sở, có khả năng điều chuyển chức vụ, đổi vị trí hoặc dự án gián đoạn. Nên lấy nhu chế cương, thuận thế chuyển biến, cưỡng ép ở lại ngược lại tổn thất.",
        "love": "Tháng xung khắc, đôi lứa dễ vì việc nhỏ mà nâng tầm tranh cãi. Người độc thân tình cảm biến hóa nhanh, bắt đầu nhanh kết thúc cũng lẹ, không nên lún sâu.",
        "health": "Tỳ vị dễ khó chịu, ăn uống kiêng kỵ đồ sống lạnh. Chú ý phòng ngừa kim loại gây thương tích, lái xe và sử dụng dao kéo phải cẩn thận.",
        "dispute": "Tương xung dẫn đến đối lập, đàm phán thương thảo dễ nảy sinh bất đồng. Bất luận lập trường ra sao, tạm thời nhượng bộ, đợi tháng sau bàn tiếp sẽ có lợi hơn."
      },
      {
        "month": "Tháng Bảy (戊申月 - Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Bát Bạch Tả Phụ tinh nhập trung cung, phòng nguy cơ phá tài. Chi tiêu nhiều hơn dự kiến, nên thắt chặt ngân sách thì có thể bình an vượt qua.",
        "career": "Sau những biến động tháng trước, tháng này dần đi vào quỹ đạo bình ổn. Nhịp độ công việc phục hồi bình thường, tranh thủ dọn dẹp việc tồn đọng, mở đường cho nửa cuối năm.",
        "love": "Vận tình cảm êm ả, không chìm nổi lớn. Người có bạn đời tận hưởng những ngày bình dị bên nhau, người độc thân nên mở rộng vòng tròn xã giao, tĩnh đợi duyên lành.",
        "health": "Kim khí tăng vượng, chú ý phổi và giữ ẩm cho da. Sáng tối chênh lệch nhiệt độ lớn, thêm áo đúng lúc để tránh cảm lạnh.",
        "dispute": "Thất Xích chủ trộm cắp và khẩu thiệt, ra ngoài bảo quản tư trang. Dù hoàn cảnh trang trọng hay không, uống rượu vừa phải tránh vạ miệng."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Thất Xích Phá Quân tinh nhập trung cung, đại lợi tài vận, là một trong những tháng tài vận tốt nhất trong năm. Chính tài lẫn thiên tài đều bội thu, có thể chủ động tiến bước.",
        "career": "Vận sự nghiệp vững bước đi lên, sự cày xới trước đó dần đến ngày thu hoạch. Nơi làm việc được cấp trên ghi nhận, cơ hội thăng chức tăng lương hiển lộ.",
        "love": "Dậu Thìn lục hợp, tình cảm hòa hợp mặn nồng. Người độc thân qua trưởng bối giới thiệu có cơ hội tìm được đối tượng, nên nghiêm túc cân nhắc.",
        "health": "Thổ Kim tương sinh, thể lực sung mãn. Song công việc khá bận rộn, nên chừa thời gian tập thể thao để duy trì sinh lực dẻo dai.",
        "dispute": "Vận thế thuận lợi càng kỵ đắc ý quên mình. Bất luận thành tựu lớn nhỏ, khiêm tốn đối đãi mọi người sẽ tránh được ghen ghét."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Lục Bạch Vũ Khúc tinh nhập trung cung, việc hỷ sự có thể mang lại thêm chi tiêu. Tài vận trồi sụt, chi tiêu số tiền lớn nên nghĩ chín chắn kẻo sau này tiếc nuối.",
        "career": "Thìn Tuất tương xung lại gặp tam hình, áp lực công việc tăng đột ngột, tranh chấp nhân sự dễ xuất hiện. Nên chuyên tâm vào bổn phận, ít lo việc bao đồng, khiêm tốn tự bảo vệ mình.",
        "love": "Cảm xúc chịu ảnh hưởng của hình xung, với bạn đời dễ cãi vã gay gắt. Người độc thân đào hoa đới kiếp, lai lịch người mới quen cần điều tra rõ ràng.",
        "health": "Tháng hình khắc, chú ý đường ruột và các vấn đề về da. Cảm xúc dao động ảnh hưởng giấc ngủ, trước khi ngủ nên thả lỏng thân tâm.",
        "dispute": "Tháng này là một đỉnh điểm thị phi khác trong năm, khẩu thiệt kiện tụng đều phải phòng. Bất kể đúng sai thuộc về ai, lùi một bước trời cao biển rộng."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên tài lộ hanh thông. Lực tam hợp có lợi cho hợp tác sinh tài, làm việc cùng người tuổi Tý, tuổi Thân càng thêm suôn sẻ.",
        "career": "Vận quý nhân mạnh mẽ, chốn công sở được nhân vật có thực lực nâng đỡ. Cơ hội hợp tác dự án tăng lên, nên chủ động xuất kích, nắm bắt thời cơ.",
        "love": "Nhân duyên đào hoa đều vượng, người độc thân tiệc tùng giao tế thường xuyên, có cơ hội gặp ý trung nhân. Người có bạn đời tình cảm bền vững, có thể lên kế hoạch tương lai.",
        "health": "Thủy khí tăng dần, chú ý giữ ấm thận và hệ tiết niệu. Ăn uống cân bằng dinh dưỡng giúp tăng cường sức đề kháng.",
        "dispute": "Nhân duyên tuy tốt song cũng phải phòng tiểu nhân trà trộn bên trong. Bất kể đối phương nhiệt tình ra sao, dính dáng tới lợi ích phải giấy trắng mực đen."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tứ Lục Văn Khúc tinh nhập trung cung, tài vận bình bình, chi tiêu lại có chiều hướng gia tăng. Nên lượng sức mà chi, chi tiêu y tế bảo vệ sức khỏe thì không nên tiếc.",
        "career": "Tháng Hại Thái Tuế, chốn công sở dễ bị tiểu nhân ngấm ngầm tính toán, hoặc vô cớ bị kéo vào tranh chấp phe phái. Nên thao quang dưỡng hối, nói ít làm nhiều.",
        "love": "Tháng ám hại, tình cảm dễ nảy sinh hiểu lầm. Trò chuyện với bạn đời cần trực tiếp rõ ràng, tránh trò chơi đoán tâm ý. Người độc thân không nên bắt đầu tình cảm mới.",
        "health": "Bệnh Phù tinh đương lệnh, sức khỏe là ưu tiên số một của tháng này. Chú ý hệ tiêu hóa, vệ sinh ăn uống để giảm thiểu ốm vặt.",
        "dispute": "Mũi tên ngầm khó phòng, tháng này ít tham gia bàn tán chuyện thiên hạ. Bất luận nghe thấy điều gì, tai trái vào tai phải ra là an toàn nhất."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tam Bích Lộc Tồn tinh nhập trung cung, tháng Tuế Phá tài vận chao đảo. Chi tiêu dịp cuối năm bộn bề, nên dự trù sớm để tránh cảnh túng thiếu giáp hạt.",
        "career": "Thời điểm tổng kết cuối năm, điềm báo biến động công sở tái hiện. Người có ý định chuyển việc nên đợi sang năm sau tiết Lập Xuân rồi hãy hành động.",
        "love": "Tháng xung khắc, đôi lứa dễ vì thu xếp kế hoạch ngày lễ hoặc việc gia đình mà tranh cãi. Người độc thân đào hoa ảm đạm, chuyên tâm cho bản thân thực tế hơn.",
        "health": "Tiếp khách cuối năm liên miên, chú ý gánh nặng của gan. Tam Bích chủ tổn thương vùng chân, đi lại và lái xe phải cẩn thận lưu tâm.",
        "dispute": "Tuế Phá kiêm sao thị phi, tháng này là giai đoạn sóng gió cuối cùng của năm. Dù gặp khiêu khích thế nào, nhẫn nhịn nhất thời, đợi năm mới vận chuyển tự khắc hanh thông."
      }
    ],
    "yearSummary": "Người tuổi Thìn năm Đinh Mùi đại thể bình ổn, có cát tinh lớn Tử Vi và Long Đức soi chiếu hóa hung thành cát. Chỉ cần giữ sự tỉnh táo trước các tháng xung hình, thận trọng trong chi tiêu và tận dụng tốt sự trợ giúp của quý nhân, bạn hoàn toàn có thể khép lại một năm viên mãn, tạo tiền đề vững chắc cho những bứt phá rực rỡ ở chu kỳ tương lai."
  },
  "Tỵ": {
    "name": "Tỵ (Rắn)",
    "chinese": "蛇",
    "english": "Snake",
    "icon": "🐍",
    "relation": "Bình Hòa",
    "relationBadge": "normal",
    "themeYear": "Tử Vi Long Đức • Tích Lũy Chờ Thời",
    "auspiciousStars": [
      "Tử Vi",
      "Long Đức",
      "Ngọc Đường"
    ],
    "inauspiciousStars": [
      "Thiên Ách",
      "Bạo Bại"
    ],
    "overview": "Người tuổi Tỵ năm Đinh Mùi 2027 bước vào năm vận thế bình hòa, không có xung khắc lớn với Thái Tuế. Đặc biệt trong cung mệnh có bộ ba cát tinh **Tử Vi**, **Long Đức**, **Ngọc Đường** kề cận nâng đỡ, mang lại năng lượng quý nhân âm thầm tương trợ, gặp nghịch cảnh có người gỡ rối, thi cử nghiên cứu học thuật thăng tiến vượt bậc. Tuy nhiên, lưu niên Hỏa Thổ khô nóng làm hao tiết nguyên khí của Tỵ Hỏa, nên năm nay thích hợp là năm **tích lũy nội lực, chờ đợi thời cơ**, làm việc thực tế cày sâu cuốc bẫm hơn là mạo hiểm đầu cơ liều lĩnh.",
    "starsAnalysis": "Cát tinh **Tử Vi** đem lại sự che chở của cấp trên và trưởng bối; **Long Đức** giải trừ tai ách nhẹ, biến nguy nan thành an lành; **Ngọc Đường** hỗ trợ danh dự học vị và uy tín nghề nghiệp. Hung tinh có **Thiên Ách** và **Bạo Bại**: Thiên Ách nhắc nhở lưu tâm sức khỏe đường ruột và hô hấp khi chuyển mùa; Bạo Bại cảnh báo tiền bạc dễ hao hụt bất ngờ nếu tham gia các phi vụ đầu cơ lướt sóng. Lời khuyên cho người tuổi Tỵ là thận trọng trong giao dịch tài chính và giữ gìn các mối quan hệ thân tín.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ ấm áp vẫn là dư âm may mắn cho người Hàn Mệnh, hãy nắm chắc giai đoạn cuối của vận Mộc Hỏa để hoàn thiện các mục tiêu lớn, củng cố thành tựu tài chính vững vàng.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Hỏa Thổ khô nóng không có lợi cho Nhiệt Mệnh, cần giữ tâm thế bình thản, thủ tĩnh dưỡng sức, chờ đợi từ mùa thu năm 2028 (khi vận Kim Thủy hưng khởi) mới là thời điểm bứt phá mạnh mẽ.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Nhịp độ công việc ổn định, kiên trì trau dồi chuyên môn, cuộc sống an nhiên hài hòa.",
    "birthYears": [
      {
        "year": 2025,
        "canChi": "Ất Tỵ",
        "age": "3 tuổi âm",
        "reading": "Tuổi nhỏ bình an lớn lên dưới sự chở che chu đáo của gia đình, chú ý phòng ngừa chứng nóng nhiệt và ăn uống thanh mát."
      },
      {
        "year": 2013,
        "canChi": "Quý Tỵ",
        "age": "15 tuổi âm",
        "reading": "Giai đoạn học hành tiếp thu tri thức có Ngọc Đường trợ lực, tư duy sáng tạo thông suốt, kết quả học tập tiến bộ vững chắc."
      },
      {
        "year": 2001,
        "canChi": "Tân Tỵ",
        "age": "27 tuổi âm",
        "reading": "Bắt đầu khẳng định vị thế trong công việc, có quý nhân ngầm nâng đỡ chỉ dẫn, hãy nỗ lực cống hiến để tạo bước đệm thăng tiến."
      },
      {
        "year": 1989,
        "canChi": "Kỷ Tỵ",
        "age": "39 tuổi âm",
        "reading": "Sự nghiệp và tài lộc ổn định vững vàng, quản lý chi tiêu tài chính gia đình khoa học, tránh các dự án đầu tư mạo hiểm."
      },
      {
        "year": 1977,
        "canChi": "Đinh Tỵ",
        "age": "51 tuổi âm",
        "reading": "Địa vị công danh vững chắc, mở rộng mối quan hệ hợp tác đáng tin cậy, chú ý chăm sóc sức khỏe tim mạch và huyết áp."
      },
      {
        "year": 1965,
        "canChi": "Ất Tỵ",
        "age": "63 tuổi âm",
        "reading": "Tuổi hưu trí an nhàn, con cháu thành đạt hòa thuận, cuộc sống thảnh thơi vui vầy bên gia đình và bạn bè thân hữu."
      },
      {
        "year": 1953,
        "canChi": "Quý Tỵ",
        "age": "75 tuổi âm",
        "reading": "Hưởng phúc an khang, giữ nếp sinh hoạt điều độ, ăn uống ấm nóng thanh đạm và chăm sóc đôi chân cẩn thận."
      },
      {
        "year": 1941,
        "canChi": "Tân Tỵ",
        "age": "87 tuổi âm",
        "reading": "Đại thọ diên niên, gia đạo hòa mục con cháu thảo hiền, thân tâm tĩnh tại trường thọ."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Chính tài bình ổn, thiên tài chưa thấy. Tháng này thích hợp quy hoạch đại kế tài chính cả năm, không nên mạo muội đầu tư dự án mới, song chi tiêu học tập nâng cao rất đáng bỏ ra.",
        "career": "Nhân tế công sở hòa thuận, cấp trên có ấn tượng không tệ về bạn. Tháng này nghe nhiều nói ít, hấp thu kiến thức mới để trải đường cho tương lai, không nên nóng vội thể hiện.",
        "love": "Đào hoa tinh động, người độc thân có cơ hội mai mối gặp gỡ, người có bạn đời tình cảm êm ả, song tiếp khách nhiều cần quan tâm cảm xúc đối phương.",
        "health": "Đầu xuân hàn lạnh chưa dứt, chú ý đường hô hấp khó chịu. Ăn uống thanh đạm là hơn, năm Hỏa Thổ kỵ tẩm bổ đồ quá khô nóng sớm.",
        "dispute": "Nhân duyên tuy tốt song nói nhiều tất lỡ lời. Tháng này không nên cuốn vào thị phi của người khác, giữ thế trung lập thì bình an qua ải."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tượng động trung cầu tài, đi công tác hoặc làm việc bên ngoài có thể có thu nhập thêm. Chính tài tạm ổn, thiên tài chớ cưỡng cầu.",
        "career": "Công việc có cơ hội biến động, hoặc cần thường xuyên đi lại. Tháng này chủ động tranh thủ đi công tác, biệt phái sẽ tương đối có lợi, ngồi yên một chỗ dễ lỡ cơ hội.",
        "love": "Tụ ít xa nhiều, người độc thân nhân duyên nơi xa có cơ hội hơn. Người có bạn đời cần giao tiếp thường xuyên, tránh vì bận rộn mà lạnh nhạt người thương.",
        "health": "Bệnh Phù tinh chiếu, đường ruột dạ dày dễ khó chịu. Ăn uống bên ngoài cần cẩn trọng, chú ý không hợp thổ nhưỡng nước nôi, người cao tuổi càng phải phòng bệnh cũ tái phát.",
        "dispute": "Tháng Dịch Mã thị phi tương đối ít, song ra ngoài cần phòng tiểu nhân ngầm ngáng đường, tài liệu giấy tờ quan trọng mang theo bên mình cất giữ."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tiền đến tiền đi, khó bề tích tụ. Tháng này không nên cho vay mượn hay đứng ra bảo lãnh cho ai, việc hùn hạp làm ăn càng phải suy nghĩ chín chắn.",
        "career": "Sóng ngầm công sở dập dềnh, đồng nghiệp dễ sinh hiểu lầm. Tháng này lấy khiêm nhường làm đầu, hoàn thành bổn phận là được, không nên cố tranh công nổi bật.",
        "love": "Cảm xúc dao động khá lớn, dễ vì chuyện nhỏ mà cãi cọ. Người độc thân không nên bắt đầu tình cảm mới trong tháng này, người có bạn đời cần bao dung lẫn nhau.",
        "health": "Can khí uất trệ, dễ đau đầu mất ngủ. Nên ngủ sớm dậy sớm, uống trà thanh nhiệt, tránh thức khuya tổn hao tâm thần.",
        "dispute": "Tam hình chồng thêm thị phi tinh, tháng này là đỉnh điểm thị phi của năm. Dù ở công sở hay đời sống, nói ít làm nhiều, gặp tranh cãi lùi một bước là hay."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Chính tài bình ổn, thu nhập ngoài luồng chưa có. Tháng này không nên đầu cơ, Văn Xương tinh lợi cho việc dùng kiến thức chuyên môn kiếm thù lao, như nâng cao kỹ năng tăng lương.",
        "career": "Tháng tương hại cần phòng tiểu nhân ám hại. Thành quả công việc tháng này có thể bị người khác dòm ngó, tài liệu quan trọng sao lưu cất giữ, lời hứa miệng không thể tin hết.",
        "love": "Tương hại cũng chủ về tình cảm có sóng ngầm, người độc thân dễ gặp đối tượng mập mờ không rõ ràng. Người có bạn đời cần thẳng thắn, nghi kỵ sẽ sinh vết nứt.",
        "health": "Hỏa khí tăng dần, da dẻ hoặc mắt dễ khó chịu. Ăn nhiều rau củ quả, tránh đồ cay nóng chiên xào, chú ý vệ sinh thị lực.",
        "dispute": "Tháng tương hại thị phi ngầm ẩn, bề ngoài hòa khí nhưng bên dưới có sóng ngầm. Tháng này không nên bình luận chuyện người khác, tĩnh lặng ở một mình là tốt."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Lục Hợp chủ quý nhân ngầm mang lại cơ hội kiếm tiền, song Nhất Bạch Tham Lang tinh nhập trung cung, đại đầu tư cần cực kỳ cẩn trọng. Chính tài tạm ổn, thấy tốt thu tay là hơn.",
        "career": "Chốn công sở có tượng quý nhân đề bạt, hoặc được cấp trên ngầm quan tâm nâng đỡ. Tháng này nên chủ động xây dựng mạng lưới quan hệ, tiệc tùng tuy nhiều song đáng tham gia.",
        "love": "Tháng Đào Hoa duyên khác giới rất tốt, người độc thân có hy vọng tìm được ý trung nhân. Người có bạn đời tình cảm thắm thiết, song dưới ảnh hưởng của Nhất Bạch không nên vội vã cưới xin.",
        "health": "Ngũ Hoàng chủ tai bệnh, tháng này là giai đoạn sức khỏe cần chú ý cao trong năm. Tránh hoạt động nguy hiểm, lái xe hết sức cẩn thận, người cao tuổi bớt ra ngoài.",
        "dispute": "Lục Hợp hóa giải phần nào thị phi, nhân duyên tương đối tốt. Song Ngũ Hoàng đương lệnh, không nên đứng làm người trung gian điều giải kẻo chuốc lấy oán thù."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Cửu Tử Hữu Bật tinh nhập trung cung, chính thiên tài đều có cơ hội. Song tháng tương xung tiền đến rồi đi, thu nhập tuy tăng nhưng chi tiêu cũng lớn, cần tuân thủ nghiêm ngặt ngân sách.",
        "career": "Tương xung chủ biến động, có thể có cơ hội chuyển việc, điều chuyển vị trí. Biến hóa chưa hẳn là xấu, song trước khi quyết định nên suy tính chín chắn, không nên bốc đồng.",
        "love": "Tháng tương xung tình cảm trồi sụt, người có bạn đời dễ nảy sinh tranh chấp. Người độc thân đào hoa tuy xuất hiện nhưng phần lớn là duyên ngắn ngủi, chớ vội lún sâu.",
        "health": "Tháng tương xung dễ va chạm tổn thương, lái xe và vận động thể thao cần thận trọng. Tỳ vị dạ dày cũng yếu hơn, ăn uống đúng giờ là mấu chốt.",
        "dispute": "Tương xung kéo theo thị phi, tháng này dễ xảy ra xung đột trực diện với người khác. Nhẫn nhịn nhất thời, lùi một bước biển rộng trời cao, không nên hành động theo cảm tính."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Thất Xích chủ phá tài, tháng này cần phòng ngừa trộm cắp hoặc làm mất đồ. Chính tài tạm vững, không nên cho vay hay bảo lãnh, hoạt động đầu cơ nhất loạt tránh xa.",
        "career": "Chốn công sở trở lại bình yên, không có biến động lớn. Tháng này nên thu xếp công việc nửa đầu năm, quy hoạch phương hướng nửa cuối năm, giấu mình chờ thời là tốt.",
        "love": "Tình cảm bình lặng, không sóng không gió. Người có bạn đời tận hưởng những ngày bình dị, người độc thân cần chủ động xuất kích, chờ đợi thụ động khó có tiến triển.",
        "health": "Kim khí tăng dần, hệ hô hấp cần lưu ý. Giao mùa hạ thu dễ bị cảm mạo, sáng tối thêm áo ấm, tránh để nhiễm lạnh.",
        "dispute": "Tháng bình ổn thị phi không nhiều, song Bát Bạch nhập trung cung dễ vì tiền bạc mà mất nghĩa khí. Giao dịch tài chính sòng phẳng rõ ràng, anh em ruột cũng phải minh bạch."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Thất Xích Phá Quân tinh nhập trung cung, đại lợi tài vận, cả chính tài lẫn thiên tài đều có thu hoạch. Song Bạo Bại tinh vẫn còn, không nên dốc hết vốn vào một canh bạc.",
        "career": "Vận sự nghiệp đi lên cùng tài vận, biểu hiện công việc được cấp trên công nhận. Tháng này nên chủ động tranh thủ cơ hội thể hiện, đề xuất dự án hay đề bạt đều có thể thử sức.",
        "love": "Tài vượng kéo theo đào hoa, người độc thân duyên khác giới rất tốt. Người có bạn đời tình cảm vững vàng, có thể cùng nhau quy hoạch tài chính tương lai.",
        "health": "Thổ Kim tương sinh, cơ thể tương đối khỏe mạnh. Song tài vận quá vượng dễ hao tổn tâm thần, chú ý cân bằng nghỉ ngơi, tránh tiệc tùng quá đà.",
        "dispute": "Tháng tài vượng dễ chuốc người đố kỵ, quản lý tài chính kín kẽ là thượng sách. Không nên khoe khoang thu nhập hay thành quả đầu tư để tránh thị phi vô cớ."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Lục Bạch Vũ Khúc tinh nhập trung cung, có thể có chi tiêu hỷ sự tiếp khách. Chính tài bình ổn, chi tiêu vì các mối quan hệ là khó tránh, ngân sách cần dự trù khoảng co giãn.",
        "career": "Dưới bóng tam hình, sóng ngầm công sở tái hiện, quan hệ đồng nghiệp căng thẳng. Tháng này chuyên tâm làm tròn phận sự, không can thiệp vào tranh giành phe phái hay biến động nhân sự.",
        "love": "Lục Bạch nhập trung có lợi cho thiên tài và địa vị, người có bạn đời bàn chuyện hôn nhân cần đề phòng ý kiến bất đồng từ các bậc trưởng bối.",
        "health": "Hỏa Thổ khô nóng tái hiện, da dẻ và hệ tiêu hóa cần lưu tâm. Ăn nhiều thực phẩm thanh nhuận nhuận táo, tránh thức khuya hao tổn chân âm.",
        "dispute": "Tam hình chồng thị phi, tháng này là đỉnh điểm thị phi của nửa cuối năm. Dù trước mặt hay sau lưng người khác, cẩn trọng lời nói là trên hết, ký kết hợp đồng xem kỹ từng điều khoản."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Tam hợp chủ quý nhân mang lại tài lộc, cơ hội hợp tác sinh tài hiển lộ. Tháng này nên bắt tay cùng người tuổi Dậu, tuổi Sửu để sự bán công bội.",
        "career": "Nhân tế công sở hòa hợp, hợp tác nhóm suôn sẻ. Tháng này thích hợp triển khai kế hoạch mới hoặc liên thủ mở rộng nghiệp vụ, thành quả thu về khả quan hơn dự kiến.",
        "love": "Ngũ Hoàng Liêm Trinh tinh nhập trung cung tái lâm, người độc thân duyên khác giới rất tốt, có hy vọng tìm được đối tượng gắn bó lâu dài. Người có bạn đời tình cảm ngọt ngào, có thể tính chuyện cưới hỏi.",
        "health": "Thủy khí tăng vượng, người Hàn Mệnh đặc biệt dễ chịu. Người Nhiệt Mệnh cần chú ý thận và bàng quang, tránh tẩm bổ đồ quá cay nóng.",
        "dispute": "Tam hợp hóa giải thị phi, vận nhân duyên tốt đẹp. Tháng này nên tham gia nhiều hoạt động xã giao, kết nối nhân mạch rất có ích cho năm tới."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tháng Hại Thái Tuế tài vận bình bình, không nên có hành động lớn. Chính tài tạm ổn, thiên tài không có, kế hoạch đầu tư nên dời sang năm tới.",
        "career": "Chốn công sở có tiểu nhân ngầm ngáng đường, tiến độ hơi bị đình trệ. Tháng này nên thủ không nên công, hoàn thành công việc hiện tại là được, kế hoạch mới tạm hoãn.",
        "love": "Hại Thái Tuế chủ hiểu lầm tình cảm, người có bạn đời cần giao lưu trò chuyện nhiều hơn. Người độc thân không nên bắt đầu tình cảm mới trong tháng này, dễ gặp sự giấu giếm lừa dối.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, lưu tâm sức khỏe. Chú ý vệ sinh ăn uống, bệnh cũ dễ tái phát, người cao tuổi cần hết sức để tâm.",
        "dispute": "Hại Thái Tuế gặp Bệnh Phù, tháng này nói ít làm nhiều. Không nên làm người trung gian, cũng chớ nhẹ dạ tin lời truyền miệng kẻo rước họa vô đơn chí."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tháng Tuế Phá tài vận trồi sụt, thưởng cuối năm có thể không như kỳ vọng. Tháng này giữ chặt túi tiền, chi tiêu tết nhất cần lượng sức mà chi.",
        "career": "Tuế Phá chủ biến động, có thể có tin tức điều chỉnh nhân sự cuối năm. Thuận theo tự nhiên, không nên cưỡng cầu, để sang năm mới tính tiếp sẽ sáng suốt hơn.",
        "love": "Tháng tương xung tình cảm dao động, người có bạn đời dễ vì chuyện lễ nghĩa tiếp khách mà sinh cãi cọ. Người độc thân đào hoa mờ nhạt, chăm sóc bản thân là tốt nhất.",
        "health": "Bận rộn cuối năm, chú ý điều dưỡng nghỉ ngơi. Dưới sao Tam Bích tâm trạng dễ nóng nảy, giữ tâm cảnh an bình, tránh để can hỏa bốc lên.",
        "dispute": "Tuế Phá chồng thêm sao thị phi, tháng này là thử thách cuối cùng của cả năm. Bất luận ở công sở hay gia đình, lấy hòa làm quý, nhường nhịn thì năm cũ sẽ trôi qua suôn sẻ an lành."
      }
    ],
    "yearSummary": "Người tuổi Tỵ trải qua năm Đinh Mùi tương đối bình ổn, không sóng to gió lớn. Dưới dòng chảy Hỏa Thổ, người Hàn Mệnh vẫn còn dư âm may mắn, người Nhiệt Mệnh thì chuẩn bị sẵn sàng cho chu kỳ mới. Năm nay là năm tích lũy nội lực, làm việc chắc chắn, chờ đợi thời cơ; sang năm 2028 Mậu Thân khi vận Kim Thủy hưng khởi, đó mới là lúc tuổi Tỵ tung cánh giương buồm đại phát."
  },
  "Ngọ": {
    "name": "Ngọ (Ngựa)",
    "chinese": "馬",
    "english": "Horse",
    "icon": "🐎",
    "relation": "Lục Hợp Thái Tuế",
    "relationBadge": "he",
    "themeYear": "Lục Hợp Quý Nhân • Hỷ Khí Đầy Nhà",
    "auspiciousStars": [
      "Nguyệt Đức",
      "Thiên Hỷ",
      "Lộc Huân",
      "Ngọc Đường"
    ],
    "inauspiciousStars": [
      "Tiểu Hao",
      "Kiếp Sát",
      "Tử Phù",
      "Quyển Thiệt"
    ],
    "overview": "Người tuổi Ngọ năm Đinh Mùi 2027 bước vào năm **Lục Hợp Thái Tuế** (Ngọ Mùi lục hợp), là một trong những con giáp có vận trình rực rỡ và may mắn hàng đầu trong năm. Lục Hợp mang lại nguồn năng lượng hòa hợp vô cùng mạnh mẽ, nhân duyên dồi dào, quý nhân nâng đỡ ở khắp các phương diện từ công việc, kinh doanh đến đời sống tình cảm gia đình. Người làm công ăn lương có cơ hội thăng quan tiến chức, người kinh doanh buôn bán mở rộng quy mô đối tác rất thuận lợi.",
    "starsAnalysis": "Năm nay cát tinh tề tựu rực rỡ gồm **Nguyệt Đức**, **Thiên Hỷ**, **Lộc Huân**, **Ngọc Đường**: Nguyệt Đức chủ phùng hung hóa cát, nhân duyên tốt lành; Thiên Hỷ mang lại hỷ sự dồn dập, cưới hỏi, sinh con, mua nhà tậu xe; Lộc Huân chủ về tài lộc dồi dào, chính tài thăng tiến vượt bậc; Ngọc Đường giúp danh tiếng và địa vị được tôn vinh. Tuy nhiên hung tinh cũng cần lưu tâm gồm **Tiểu Hao**, **Kiếp Sát**, **Tử Phù**, **Quyển Thiệt**: Tiểu Hao gây hao tốn tiền bạc nhỏ nhặt trong các cuộc vui chơi tiệc tùng; Kiếp Sát nhắc nhở cẩn thận tài sản khi đi xa; Tử Phù khuyên nên chú ý sức khỏe người già trong gia đình; Quyển Thiệt dễ mang lại thị phi đàm tiếu nếu quá tự mãn khoe khoang.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ ấm áp cực kỳ tương hợp với người Hàn Mệnh, lại được Lục Hợp trợ lực, đây là thời cơ ngàn vàng để dốc sức tiến công, mở rộng kinh doanh, đón nhận tài lộc dồi dào bội phần.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Hỏa Thổ của năm có phần hơi khô táo đối với Nhiệt Mệnh, tuy được Lục Hợp mang lại nhiều cơ hội nhưng cần giữ tâm lý điềm tĩnh, bớt nóng vội, bổ sung yếu tố Thủy (hướng Tây Bắc, màu đen, lam, trắng, xám) để điều hòa sinh khí.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Vận trình bình ổn và phát triển thuận lợi, nắm bắt cơ hội nâng cao chuyên môn, xây dựng các mối quan hệ xã giao bền vững.",
    "birthYears": [
      {
        "year": 2026,
        "canChi": "Bính Ngọ",
        "age": "2 tuổi âm",
        "reading": "Bé thơ được gia đình hết lòng yêu thương bảo bọc, ăn ngủ ngon giấc, chú ý giữ gìn vệ sinh và phòng ngừa dị ứng thời tiết giao mùa."
      },
      {
        "year": 2014,
        "canChi": "Giáp Ngọ",
        "age": "14 tuổi âm",
        "reading": "Học hành thông minh sáng dạ, được thầy cô bạn bè yêu mến giúp đỡ, cần duy trì tính kỷ luật tự giác để đạt kết quả xuất sắc."
      },
      {
        "year": 2002,
        "canChi": "Nhâm Ngọ",
        "age": "26 tuổi âm",
        "reading": "Tuổi trẻ nhiệt huyết lập thân, năm Lục Hợp mở ra nhiều cơ hội việc làm và giao lưu xã hội, hãy tự tin thể hiện năng lực để khẳng định mình."
      },
      {
        "year": 1990,
        "canChi": "Canh Ngọ",
        "age": "38 tuổi âm",
        "reading": "Sự nghiệp thăng hoa chín muồi, tài lộc dồi dào, gia đạo đón nhiều tin vui hỷ sự, cần chú ý cân bằng giữa công việc và gia đình."
      },
      {
        "year": 1978,
        "canChi": "Mậu Ngọ",
        "age": "50 tuổi âm",
        "reading": "Vị thế sự nghiệp vững vàng như bàn thạch, uy tín trong ngành được tôn trọng, quản lý tài chính khoa học để tích lũy tài sản bền vững."
      },
      {
        "year": 1966,
        "canChi": "Bính Ngọ",
        "age": "62 tuổi âm",
        "reading": "Tuổi hoa giáp an nhàn, con cháu thảo hiền thành đạt mang lại nhiều niềm vui, chú ý duy trì chế độ dinh dưỡng thanh đạm, tập thể dục nhẹ nhàng."
      },
      {
        "year": 1954,
        "canChi": "Giáp Ngọ",
        "age": "74 tuổi âm",
        "reading": "Hưởng phúc an khang bên con cháu, giữ tâm thái vui vẻ thanh thản, chú ý chăm sóc hệ tim mạch và đường huyết."
      },
      {
        "year": 1942,
        "canChi": "Nhâm Ngọ",
        "age": "86 tuổi âm",
        "reading": "Đại thọ trường an, gia tộc hưng thịnh ấm êm, sống vui sống khỏe cùng cháu chắt thân yêu."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Tài vận tháng này bình ổn, Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên tốt dễ mang lại thương cơ. Song là tháng tư tưởng học tập đầu tư, chi tiêu cho việc học hành hoặc dự án mới khá nhiều, cần dự trù ngân sách chu toàn.",
        "career": "Sự nghiệp có ý tưởng mới manh nha, thích hợp trù hoạch đại kế cả năm. Cấp trên và đồng nghiệp hòa thuận, dự án hợp tác tiến triển thuận lợi, song kế hoạch chưa thành hình không nên khoe khoang.",
        "love": "Đào hoa tinh nhập trung cung, người độc thân cơ hội xã giao tăng lên, dễ gặp đối tượng tâm đầu ý hợp. Người có bạn đời tình cảm êm ấm, song tiếp khách nhiều cần chừa thời gian bên cạnh người thương.",
        "health": "Thân thể không có trở ngại lớn, song dịp tết ăn uống thịnh soạn, cần chú ý gánh nặng đường ruột dạ dày, tránh tẩm bổ quá đà.",
        "dispute": "Nhân duyên chan hòa, thị phi tương đối ít. Song nói nhiều tất lỡ lời, lúc vui vẻ sum họp không nên bàn tán chuyện đời tư người khác để tránh hiểu lầm vô cớ."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tháng Dịch Mã chủ biến động, tài vận theo bước chân đi lại mà đến, đi công tác xa hoặc hợp tác phương xa có thu hoạch. Song Tứ Lục Văn Khúc tinh nhập trung cung, cần phòng ngừa vì vấn đề sức khỏe mà hao tổn tiền của.",
        "career": "Sự nghiệp có cơ hội đi xa, phát triển ở phương xa tương đối có lợi. Tháng này biến động nhiều, kế hoạch đuổi không kịp biến hóa, cần giữ sự linh hoạt, không nên cố chấp giữ định kiến.",
        "love": "Vận tình cảm bình ổn, người độc thân tình duyên nơi xa khá tốt. Người có bạn đời nếu tạm xa cách hai nơi cần tăng cường sẻ chia trò chuyện, tránh vì khoảng cách mà sinh lạnh nhạt.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, sức khỏe là trọng tâm của tháng này. Chú ý vệ sinh ăn uống, bệnh cũ dễ tái phát, cần sớm điều dưỡng, chớ giấu bệnh sợ khám.",
        "dispute": "Tháng Dịch Mã thị phi không nhiều, song khi ra ngoài cần chú ý lời ăn tiếng nói, quan hệ nhân tế nơi đất khách cần cẩn thận vun vén để tránh sóng gió vô cớ."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tháng này tài vận trồi sụt, Tam Bích Lộc Tồn tinh nhập trung cung, dễ vì khẩu thiệt mà hao tổn tài vật. Đầu tư cần hết sức thận trọng, không nên nhẹ dạ tin tin đồn của người khác để bảo toàn nguồn vốn.",
        "career": "Tháng tam hình sự nghiệp dễ gặp trở ngại, quan hệ đồng nghiệp căng thẳng, dự án hợp tác dễ sinh biến số. Giữ sự khiêm tốn, chuyên tâm vào bổn phận thì có thể bình an vượt qua.",
        "love": "Tình cảm dễ nảy sinh hiểu lầm, chuyện nhỏ xé ra to, cần bao dung nhiều hơn. Người độc thân không nên bắt đầu tình cảm mới trong tháng này, quan sát thêm là hơn.",
        "health": "Tâm trạng dễ bị ảnh hưởng, can hỏa khá vượng, cần chú ý sinh hoạt đúng giờ, vận động điều độ để xả stress.",
        "dispute": "Tam Bích thị phi tinh nhập trung cung, tháng này là tháng thị phi khá nhiều trong năm. Lời nói nhất thiết phải cẩn trọng, không tham gia vào phân tranh nhân sự để giảm bớt liên lụy."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Tài vận dần đi vào ổn định, Nhị Hắc Cự Môn tinh nhập trung cung, lợi cho việc cầu tài bằng tri thức chuyên môn. Chính tài có bước tiến, thiên tài không nên cưỡng cầu để giữ vững an toàn.",
        "career": "Tháng tương hại quan hệ nhân tế ngầm chứa mâu thuẫn, bề ngoài hòa thuận thực chất mỗi người một toan tính. Văn Xương tinh chiếu, lợi cho thi cử nâng ngạch, có thể mượn việc trau dồi bản thân hóa giải áp lực nhân sự.",
        "love": "Tình cảm ngầm chứa sóng gợn, dễ có hiểu lầm ngấm ngầm. Người có bạn đời cần thẳng thắn giao lưu, người độc thân cần quan sát nhân phẩm đối phương, không nên vội vã.",
        "health": "Sức khỏe không có gì đáng ngại, song tháng tương hại cảm xúc khá trồi sụt, cần chú ý sức khỏe tâm lý, gặp chuyện chớ nên suy nghĩ quẩn quanh.",
        "dispute": "Thị phi giảm bớt so với tháng trước, song tiểu nhân giấu mặt vẫn cần đề phòng. Dù trước mặt hay sau lưng người khác, lời nói giữ lại ba phần để tránh họa từ miệng mà ra."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Tháng này là tháng Lục Hợp, nhân duyên và tài vận đều tốt, Nhất Bạch Tham Lang tinh nhập trung cung cần mọi sự cẩn trọng. Chính tài ổn định, đầu tư số tiền lớn nên tạm hoãn.",
        "career": "Lục Hợp quý nhân lâm môn, sự nghiệp có cơ hội hợp tác trọng đại, cấp trên tán thưởng, cấp dưới ủng hộ. Song Ngũ Hoàng đương lệnh, quyết định lớn cần kiểm tra lại từng chi tiết.",
        "love": "Tháng Đào Hoa tình cảm hòa hợp, người độc thân duyên khác phái cực tốt, dễ gặp đối tượng hợp ý. Người có bạn đời tình cảm thăng hoa, có thể tính chuyện hôn nhân cưới hỏi.",
        "health": "Nhất Bạch Tham Lang nhập trung, nhân duyên đào hoa vượng nhưng tránh hoạt động nguy hiểm cao, đi đứng cẩn thận để giữ bình an.",
        "dispute": "Nhân duyên chan hòa, thị phi tương đối ít. Song đào hoa quá thịnh dễ chuốc hiểu lầm, giao thiệp với người khác phái cần giữ khoảng cách thích hợp để tránh lời đàm tiếu."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Tháng này là tháng tương xung, tài vận dao động khá lớn, Cửu Tử Hữu Bật tinh nhập trung cung lợi cho tài vận song cũng chủ về biến động. Chính tài tạm ổn, thiên tài không nên, cần giữ thế thủ vững.",
        "career": "Sự nghiệp biến động khá lớn, kế hoạch dễ có biến cố bất ngờ, nhiệm vụ lâm thời tăng lên. Song Hữu Bật tinh chiếu, nguy nan có cơ hội, bình tĩnh ứng đối thì chuyển nguy thành an.",
        "love": "Tháng tương xung tình cảm dễ sinh sóng gió, việc nhỏ dễ nảy sinh cãi vã. Người có bạn đời cần nhường nhịn lẫn nhau, người độc thân không nên đưa ra quyết định tình cảm trọng đại trong tháng này.",
        "health": "Tháng tương xung cơ thể khá mệt mỏi, cần chú ý nghỉ ngơi, tránh làm việc quá sức lao lực. Người lái xe đi lại phải hết sức lưu tâm cẩn trọng.",
        "dispute": "Tháng này biến động nhiều, thị phi theo đó mà sinh. Dù gặp việc gì hãy giữ bình tĩnh, không nên hành động theo cảm tính để giảm bớt xung đột va chạm."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này tài vận bình ổn, Bát Bạch Tả Phụ tinh nhập trung cung cần phòng phá tài. Chính tài từng bước tiến triển, không nên tham gia các phi vụ đầu tư rủi ro cao hay cho người khác vay mượn.",
        "career": "Sự nghiệp bước vào giai đoạn bình ổn, những xáo trộn tháng trước dần đi vào nền nếp. Tranh thủ cơ hội này tổng kết suy nghĩ, quy hoạch phương hướng nửa cuối năm để mở đường cho tháng sau.",
        "love": "Vận tình cảm êm ả, không chìm nổi lớn. Người có bạn đời chung sống thuận hòa, người độc thân cần chủ động mở rộng mạng lưới giao tế, không nên ôm cây đợi thỏ.",
        "health": "Tình trạng sức khỏe hồi phục, Bát Bạch Tả Phụ chiếu mệnh cần phòng tổn thương do kim loại đồ nhọn, thao tác thường nhật lưu tâm cẩn thận.",
        "dispute": "Tháng bình ổn thị phi không nhiều, quan hệ nhân tế hòa hoãn. Phá Quân tinh chủ hao tổn, việc dính tới tiền bạc phải giấy trắng mực đen rõ ràng để tránh tranh chấp sau này."
      },
      {
        "month": "Tháng Tám (己酉 - Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này đại lợi tài vận, Thất Xích Phá Quân tinh nhập trung cung, là một trong những tháng tài vận tốt nhất trong năm. Chính tài lẫn thiên tài đều có thu hoạch, có thể chủ động tiến bước nhưng không nên quá mạo hiểm.",
        "career": "Vận sự nghiệp hanh thông trôi chảy, thành quả giai đoạn trước dần hiển lộ, cấp trên công nhận, cơ hội thăng tiến xuất hiện. Cần nắm bắt thời cơ thể hiện năng lực.",
        "love": "Tình cảm hòa thuận, sự nghiệp suôn sẻ kéo theo tâm trạng vui vẻ, ở bên bạn đời mặn nồng gắn kết. Người độc thân có thể qua môi trường làm việc mà quen đối tượng hợp ý.",
        "health": "Thân thể khỏe mạnh, tinh thần tràn trề sinh lực. Song công việc khá bận rộn, cần lưu ý cân bằng nghỉ ngơi, tránh tiêu hao thể lực quá mức.",
        "dispute": "Vận thế thuận buồm xuôi gió, thị phi tương đối ít. Song khi tài vận tốt càng cần khiêm nhường để giữ phúc bền lâu."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Tài vận trồi sụt, Lục Bạch Vũ Khúc tinh nhập trung cung chủ hỷ sự cũng chủ chi tiêu. Chính tài tạm ổn, tiệc tùng tiếp khách tăng lên, cần kiểm soát ngân sách.",
        "career": "Tháng tam hình sự nghiệp dễ gặp trở ngại, quan hệ đồng nghiệp căng thẳng, hợp tác dễ sinh ma sát. Lục Bạch nhập trung có lợi cho thiên tài và chức vụ, hãy bình tĩnh giải quyết từng việc.",
        "love": "Tháng hỷ sự đào hoa, người độc thân cơ hội tình cảm tăng lên. Người có bạn đời dễ vì bận rộn tiếp khách mà lơ là đối phương, cần chừa thời gian riêng tư bên nhau.",
        "health": "Sức khỏe không có gì đáng ngại, song tháng tam hình cảm xúc dễ bị tác động, cần chú ý ăn uống đúng giờ, tránh mượn bia rượu để giải tỏa áp lực.",
        "dispute": "Tháng tam hình thị phi khá nhiều, quan hệ nhân tế phức tạp. Dù nơi công hay tư, nói ít làm nhiều thì giảm bớt rủi ro bị cuốn vào tranh chấp."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Tháng này là tháng tam hợp, tài vận theo nhân duyên mà tới, Ngũ Hoàng Liêm Trinh tinh nhập trung cung lợi cho tài lộc đào hoa nhân duyên. Chính tài ổn định, hợp tác sinh tài rất có lợi.",
        "career": "Tam hợp quý nhân lâm môn, sự nghiệp có cơ hội hợp tác trọng đại, tinh thần đồng đội là chìa khóa thành công của tháng này. Cần chủ động liên lạc bạn bè cũ, mở rộng nhân mạch.",
        "love": "Ngũ Hoàng tái nhập trung cung, vận tình cảm cực tốt. Người độc thân dễ gặp đối tượng ưng ý, người có bạn đời tình cảm ngọt ngào, có thể bàn bạc kế hoạch lâu dài.",
        "health": "Sức khỏe tốt, tinh thần phơi phới. Hoạt động xã giao nhiều cần chú ý nghỉ ngơi, tránh tiệc tùng quá đà hao tổn sinh lực.",
        "dispute": "Tháng tam hợp nhân duyên chan hòa, thị phi tương đối ít. Song đào hoa quá thịnh cần phòng đào hoa xấu, giao thiệp với người khác giới cần phân định rõ ý đồ đối phương."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tháng này là tháng Hại Thái Tuế, tài vận khá trồi sụt, Tứ Lục Văn Khúc tinh nhập trung cung cần phòng vì sức khỏe mà hao tài. Chính tài tạm ổn, không nên đưa ra quyết định tài chính trọng đại.",
        "career": "Sự nghiệp dễ có trở ngại ngầm, kế hoạch xúc tiến không thuận, tiểu nhân ẩn nấp. Giữ sự nhẫn nại, chuyên tâm vào bổn phận thì dần dần hóa giải được trắc trở.",
        "love": "Tình cảm dễ sinh sóng ngầm, hiểu lầm dễ nảy sinh. Người có bạn đời cần giao lưu trò chuyện nhiều hơn, người độc thân không nên nóng vội bắt đầu tình cảm mới, quan sát kỹ là hơn.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, sức khỏe là trọng tâm của tháng này. Chú ý giữ ấm, hệ hô hấp dễ khó chịu, cần sớm điều dưỡng giữ gìn.",
        "dispute": "Tháng Hại Thái Tuế thị phi khá nhiều, dễ bị gièm pha sau lưng. Bất kể nghe thấy điều gì, không nên phản ứng tức thì, xác minh rồi hãy xử lý để tránh bị người khác lợi dụng."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tháng này là tháng Tuế Phá, tài vận dao động khá lớn, Tam Bích Lộc Tồn tinh nhập trung cung cần phòng vì khẩu thiệt mà hao tổn tài vật. Chính tài nên giữ vững, thưởng cuối năm cần sử dụng hợp lý.",
        "career": "Tháng Tuế Phá sự nghiệp biến động lớn, tổng kết cuối năm dễ có biến số. Cần hoàn thành trọn vẹn công việc trong tay, không nên mở màn kế hoạch mới lúc này.",
        "love": "Tháng tương xung tình cảm dễ có sóng gió, tiệc tùng cuối năm dày đặc dễ sinh hiểu lầm. Người có bạn đời cần thông cảm cho nhau, người độc thân không nên vội quyết định chuyện đại sự.",
        "health": "Tháng Tuế Phá cơ thể khá mệt mỏi, cần nghỉ ngơi sớm để nạp năng lượng cho năm tới. Chú ý an toàn giao thông, đi lại cẩn thận.",
        "dispute": "Tam Bích thị phi tinh nhập trung cung, tháng này là tháng thị phi khá nhiều của cả năm. Lời nói nhất thiết phải cẩn trọng, tránh xa tranh chấp nhân sự thì an nhiên đón tết, hân hoan đón chào năm mới."
      }
    ],
    "yearSummary": "Người tuổi Ngọ năm Đinh Mùi được cát tinh hội tụ, Lục Hợp che chở tạo nên một năm đại cát đại lợi. Cả công danh, tài lộc lẫn tình cảm gia đạo đều bội thu rực rỡ. Hãy nắm chắc thời cơ để mở rộng sự nghiệp, đối đãi chân thành với mọi người, sống khiêm nhường bao dung thì phúc lộc sẽ đơm hoa kết trái dài lâu."
  },
  "Mùi": {
    "name": "Mùi (Dê)",
    "chinese": "羊",
    "english": "Goat",
    "icon": "🐐",
    "relation": "Trực Thái Tuế (Bản Mệnh Năm)",
    "relationBadge": "tai",
    "themeYear": "Trực Thái Tuế • Tĩnh Lặng Dưỡng Sức",
    "auspiciousStars": [
      "Thái Dương",
      "Thiên Ất Quý Nhân",
      "Văn Xương",
      "Tuế Giá"
    ],
    "inauspiciousStars": [
      "Thái Tuế",
      "Kiếm Phong",
      "Phục Thi",
      "Tam Hình"
    ],
    "overview": "Người tuổi Mùi năm Đinh Mùi 2027 bước vào **Năm Bản Mệnh (Trực Thái Tuế)**. Dân gian thường nói 'Thái Tuế đương đầu tọa, vô hỷ tất hữu họa'. Năm tuổi tượng trưng cho sự chuyển biến, áp lực tâm lý gia tăng, cảm xúc dễ bồn chồn dao động. Tuy nhiên, năm Đinh Mùi tuổi Mùi lại được các đại cát tinh như **Thái Dương**, **Thiên Ất Quý Nhân**, **Văn Xương**, **Tuế Giá** tề tựu soi chiếu, đem lại nguồn trợ lực mạnh mẽ từ nam quý nhân, cấp trên và các cơ hội học tập nâng cao địa vị danh tiếng. Chỉ cần lấy sự vững vàng ổn định làm kim chỉ nam, tĩnh lặng dưỡng sức, không hành động bốc đồng thì hoàn toàn có thể biến năm tuổi thành bệ phóng chuyển mình vững chắc.",
    "starsAnalysis": "Cát tinh có **Thái Dương**, **Thiên Ất Quý Nhân**, **Văn Xương**, **Tuế Giá**: Thái Dương chủ quý nhân nam giới tương trợ, đặc biệt có lợi cho các ngành nghề do nam giới chi phối; Thiên Ất mang sức mạnh phùng hung hóa cát tuyệt vời; Văn Xương đại lợi cho thi cử, học vấn, giấy tờ hợp đồng; Tuế Giá giúp người làm quản lý củng cố quyền uy vị trí. Hung tinh có **Thái Tuế**, **Kiếm Phong**, **Phục Thi**, **Tam Hình**: Thái Tuế gây xáo trộn tâm lý; Kiếm Phong chủ tổn thương do kim loại vật sắc nhọn, người lái xe hay làm việc với máy móc phải cẩn trọng; Phục Thi nhắc nhở lưu tâm sức khỏe người cao tuổi trong gia đình; Tam Hình khiến quan hệ đồng nghiệp bạn bè dễ phát sinh ma sát.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ ấm áp là năm đắc địa cho Hàn Mệnh, tuy gặp Trực Thái Tuế có chút áp lực tâm lý nhưng cơ hội tài lộc kinh doanh rất sáng sủa. Hãy tự tin tiến bước, cẩn thận trong chi tiết hợp đồng để gặt hái thành công trọn vẹn.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Hỏa Thổ trùng điệp của năm tuổi khiến người Nhiệt Mệnh rất dễ nóng nảy bức bối. Cần tăng cường bổ sung yếu tố Thủy (hướng Tây Bắc, màu đen, xanh lam, trắng, xám) để làm dịu tâm trạng, dĩ tĩnh chế động, không nên mạo hiểm đầu tư lớn.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Giữ nhịp độ sinh hoạt điều độ, chú ý chăm sóc tỳ vị dạ dày, học thêm kỹ năng mới để gia tăng giá trị bản thân.",
    "birthYears": [
      {
        "year": 2027,
        "canChi": "Đinh Mùi",
        "age": "1 tuổi âm",
        "reading": "Bé thơ chào đời năm Đinh Mùi, được gia đình yêu thương chăm sóc chu đáo, chú ý giữ ấm phổi và ăn uống hợp vệ sinh."
      },
      {
        "year": 2015,
        "canChi": "Ất Mùi",
        "age": "13 tuổi âm",
        "reading": "Năm tư tưởng học tập, khả năng tập trung nâng cao, song năm tuổi tâm trạng dễ dao động, phụ huynh nên kiên nhẫn khích lệ định hướng, chú ý tỳ vị dạ dày nhạy cảm."
      },
      {
        "year": 2003,
        "canChi": "Quý Mùi",
        "age": "25 tuổi âm",
        "reading": "Mới ra trường hoặc lập thân, vận nhân duyên tốt, sao Thái Dương lợi cho sự nâng đỡ của thầy cô cấp trên, chuyện tình cảm chưa nên vội vàng lún sâu kẻo phân tâm sự nghiệp."
      },
      {
        "year": 1991,
        "canChi": "Tân Mùi",
        "age": "37 tuổi âm",
        "reading": "Năm phấn đấu sự nghiệp, sao Tuế Giá chiếu mệnh, người ở vị trí quản lý có cơ hội thăng tiến, song tam hình ảnh hưởng đoàn kết nội bộ, dùng người phải thận trọng."
      },
      {
        "year": 1979,
        "canChi": "Kỷ Mùi",
        "age": "49 tuổi âm",
        "reading": "Tài vận trồi sụt khá lớn, đầu tư nên bảo thủ, chi tiêu gia đình có thể tăng lên, chuẩn bị nguồn quỹ dự phòng là thượng sách."
      },
      {
        "year": 1967,
        "canChi": "Đinh Mùi",
        "age": "61 tuổi âm",
        "reading": "Tròn một hoa giáp tái ngộ Đinh Mùi, sức khỏe là trọng tâm của năm, sao Phục Thi động, bản thân và người lớn tuổi đều cần lưu ý, sự nghiệp nên thủ không nên công."
      },
      {
        "year": 1955,
        "canChi": "Ất Mùi",
        "age": "73 tuổi âm",
        "reading": "Năm an hưởng thành quả, Thiên Ất quý nhân hóa giải bệnh vặt, bớt giao tế tiệc tùng, tĩnh dưỡng thanh thản là hay nhất."
      },
      {
        "year": 1943,
        "canChi": "Quý Mùi",
        "age": "85 tuổi âm",
        "reading": "Bát tuần đại thọ, khí Trực Thái Tuế tiêu hao chút tinh lực, ăn uống ấm nóng bồi bổ là trước tiên, sống thuận theo tự nhiên thì năm tháng tĩnh tại an lành."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên mang lại tài lộc, thương thảo hợp tác tương đối thuận lợi, kế hoạch mới có thể bắt đầu trù bị. Song đầu năm bản mệnh, đầu tư số tiền lớn vẫn nên quan sát, không nên vội vàng triển khai.",
        "career": "Văn Xương tinh khí tiếp nối, lợi cho học tập thi cử, thi lấy chứng chỉ chuyên môn, người vừa học vừa làm có tiến độ lý tưởng. Nhân tế công sở hòa hợp, cấp trên có ấn tượng rất tốt.",
        "love": "Đào hoa tinh động, người độc thân nơi xã giao có cơ hội quen biết đối tượng, song phần lớn là duyên ngắn ngủi, chớ vội lún sâu. Người có bạn đời hòa hợp, có thể thu xếp chuyến du lịch ngắn ngày.",
        "health": "Đầu xuân hàn ẩm chưa tan, chú ý xương khớp và bệnh vặt đường hô hấp, ăn uống nên thanh đạm. Khởi đầu năm bản mệnh, sinh hoạt điều độ đặc biệt quan trọng.",
        "dispute": "Nhân duyên tuy tốt song trong lúc trò chuyện kỵ bình phẩm chuyện riêng tư của người khác kẻo lời vô tâm truyền tới tai người nghe."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Dịch Mã mang lại tài lộc, ra ngoài đàm phán hoặc khách hàng phương xa kỳ vọng mang lại nguồn thu, người làm thương mại xuất nhập khẩu logistic càng thuận lợi. Song chi tiêu đi lại ăn ở tăng theo, cần dự trù ngân sách.",
        "career": "Cơ hội điều động công tác hoặc biệt phái nổi lên, biến động tuy không như mong muốn lúc đầu song về lâu dài lợi cho mở rộng tầm nhìn. Tháng này không nên từ chối thử thách mới.",
        "love": "Tượng tụ ít xa nhiều, người có bạn đời cần giao lưu trò chuyện thường xuyên tránh vì bận rộn mà sinh xa cách. Người độc thân tình duyên nơi xa khá tốt, kết bạn trên mạng cần xác minh cẩn thận.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, bôn ba mệt mỏi dễ kiệt sức, sức đề kháng hơi yếu. Chú ý vệ sinh ăn uống, tránh đồ sống lạnh.",
        "dispute": "Ra ngoài công tác dễ gặp người soi mói tiểu tiết, giữ thái độ chuyên nghiệp thì tự nhiên hóa giải, không cần phải tranh cãi hơn thua."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tam Bích Lộc Tồn tinh nhập trung cung, tiền đến tiền đi, chi tiết hợp đồng nhất thiết phải kiểm tra kỹ nhiều lần tránh vì sơ sót văn bản mà tổn thất. Không nên đứng ra bảo lãnh cho người khác.",
        "career": "Thái Tuế tam hình, sóng ngầm công sở dập dềnh, với đồng nghiệp dễ sinh hiểu lầm, quyết định quan trọng không nên hạ hồi trong tháng này. Khiêm nhường làm việc, tránh xa tranh cãi khẩu thiệt.",
        "love": "Cảm xúc dao động khá lớn, chuyện nhỏ dễ phóng đại thành mâu thuẫn, ở bên bạn đời nên bao dung nhiều hơn. Người độc thân đào hoa đới kiếp, lai lịch người mới quen cần tìm hiểu rõ ràng.",
        "health": "Tỳ vị dạ dày khá yếu, áp lực dễ dẫn tới khó tiêu, nên chia nhiều bữa nhỏ. Chú ý dị ứng da và bệnh cũ tái phát.",
        "dispute": "Tháng này là đỉnh điểm thị phi của năm, bất luận thân sơ đều nên cẩn ngôn thận hạnh, chính trị công sở đặc biệt cần né tránh để khỏi bị cuốn vào oan uổng."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Nhị Hắc Cự Môn tinh nhập trung cung, là tháng dùng tri thức kỹ năng đổi lấy tiền bạc, thu nhập từ dịch vụ chuyên môn tư vấn cố vấn ổn định. Chính tài tạm ổn, thiên tài chớ cưỡng cầu.",
        "career": "Tháng tương hại quan hệ hợp tác dễ sinh hiềm khích, làm ăn chung sổ sách phải rõ ràng minh bạch. Người làm việc độc lập vận thế tốt hơn vì bớt phụ thuộc vào người khác.",
        "love": "Ảnh hưởng của tương hại, với bạn đời dễ vì chuyện gia đình hoặc quan niệm tiền bạc mà tranh cãi, nên bình tĩnh bàn bạc, chớ để bên thứ ba can thiệp. Người độc thân duyên phận bình lặng.",
        "health": "Hỏa khí tăng dần, chú ý mắt và tim mạch chịu tải nặng, thức khuya càng thêm hại. Uống nhiều nước, ăn uống thanh đạm để cân bằng tính khô nóng.",
        "dispute": "Tháng ngầm hại, lòng phòng người không thể thiếu, đặc biệt là tin nhắn trên mạng dễ sinh hiểu lầm, việc quan trọng nên gặp mặt xác nhận trực tiếp."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Nhất Bạch Tham Lang tinh nhập trung cung, mọi việc cẩn trọng. Tài vận tuy có Lục Hợp quý nhân dẫn đường, song sát tinh đương lệnh, không nên khai mở đầu tư mới. Giữ tiền an toàn là hơn.",
        "career": "Lục Hợp mang lại thời cơ hợp tác, dự án mới thương thảo thuận lợi, song chịu ảnh hưởng Ngũ Hoàng, ký hợp đồng nên đợi sang tháng sau. Công sở có quý nhân ngầm chỉ điểm, nên lắng nghe tiếp thu ý kiến.",
        "love": "Tháng Đào Hoa nhân duyên chan hòa, người độc thân xã giao sôi nổi, có cơ hội qua trưởng bối giới thiệu quen người vừa ý. Người có bạn đời tình cảm thắm thiết, có thể bàn chuyện hôn nhân.",
        "health": "Ngũ Hoàng chủ tai bệnh, tháng này cần chú ý sức khỏe nhất trong năm, tránh hoạt động nguy hiểm và đi viếng tang. Người lái xe đặc biệt cẩn thận lưu tâm.",
        "dispute": "Đào hoa quá thịnh ngược lại chuốc lòng đố kỵ, giao thiệp với người khác phái giữ khoảng cách thích hợp để tránh tin đồn làm tổn hại thanh danh."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Cửu Tử Hữu Bật tinh nhập trung cung, vốn lợi tài vận song tháng tương xung biến số lớn, chính tài tạm ổn, thiên tài chớ đụng. Có nguy cơ phát sinh chi tiêu đột xuất, dự trù sẵn ngân sách.",
        "career": "Tương xung chủ biến động, vị trí công việc hoặc phạm vi chức trách có thể có điều chỉnh đột xuất, ban đầu có thể chưa quen song về lâu dài chưa hẳn là xấu. Giữ sự linh hoạt ứng đối.",
        "love": "Tương xung ảnh hưởng tâm trạng, với bạn đời dễ lời qua tiếng lại chuyện nhỏ hóa to, nên tạm thời tách ra bình tĩnh. Người độc thân không nên bắt đầu tình cảm mới trong tháng này.",
        "health": "Tháng bản mệnh cộng thêm tương xung, cơ thể tương đối suy nhược, chú ý bệnh đường ruột và da dẻ. Tránh làm việc quá sức, nên thu xếp khám sức khỏe tổng quát.",
        "dispute": "Tháng tương xung ma sát nhân tế khó tránh, trao đổi với trưởng bối, cấp trên đặc biệt cần chú ý ngữ khí, lùi một bước biển rộng trời cao."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Bát Bạch Tả Phụ tinh nhập trung cung, phòng phá tài, thị trường đầu tư biến động khá lớn, không nên đuổi đỉnh bán đáy. Chi tiêu hàng ngày cần tiết chế, tránh mua sắm bốc đồng.",
        "career": "Vận thế hồi phục bình ổn, biến động tháng trước dần thích nghi, hiệu suất công việc nâng cao. Dự án độc lập tiến triển thuận lợi, làm việc nhóm thì vẫn cần thêm thời gian mài giũa.",
        "love": "Đời sống tình cảm êm ả, không chìm nổi lớn cũng là điều tốt lành. Người có bạn đời tận hưởng niềm vui giản dị đời thường, người độc thân nên tập trung nâng cấp bản thân.",
        "health": "Kim khí tăng dần, chú ý bảo dưỡng phổi và đường hô hấp, thể chất mẫn cảm chú ý chất lượng không khí. Vận động vừa sức, tránh quá sức kiệt sức.",
        "dispute": "Tháng bình ổn thị phi giảm bớt rõ rệt, song Thất Xích chủ trộm cắp, ra ngoài chú ý cẩn thận tư trang tiền bạc."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Thất Xích Phá Quân tinh nhập trung cung, đại lợi tài vận, là một trong những tháng tài vận tốt nhất trong năm của tuổi Mùi. Cả chính tài lẫn thiên tài đều có thu hoạch, đầu tư trước đó kỳ vọng thu hồi sinh lời.",
        "career": "Vận sự nghiệp đồng bộ thăng tiến cùng tài vận, biểu hiện được cấp trên ghi nhận, có cơ hội tăng lương thăng chức. Báo cáo thuyết trình, đàm phán quan trọng nên sắp xếp tiến hành trong tháng này.",
        "love": "Tài vận hanh thông, tâm trạng thư thái, ở bên bạn đời hòa thuận êm ấm, có thể cùng nhau quy hoạch tương lai. Người độc thân nhờ thành tích công việc mà thu hút ánh mắt ngưỡng mộ.",
        "health": "Thổ Kim tương sinh, trạng thái cơ thể khá tốt, song công việc bận rộn dễ bỏ quên nghỉ ngơi, chú ý cân bằng làm việc và thư giãn. Ăn uống nên nhuận táo dưỡng phế.",
        "dispute": "Vận thế thuận buồm xuôi gió kỵ phong mang quá lộ, lúc chia sẻ thành quả nên quan tâm cảm xúc người khác để tránh chuốc đố kỵ vô cớ."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Lục Bạch Vũ Khúc tinh nhập trung cung, hỷ sự mang lại tài lộc, cưới hỏi sinh con có thể tăng thêm chi tiêu, song về lâu dài là điềm lành cát lợi. Chính tài ổn định, không nên đầu cơ.",
        "career": "Tam hình tái lâm, nhân tế công sở lại xuất hiện sóng ngầm, với đồng nghiệp ngang hàng dễ sinh cạnh tranh cọ xát. Chuyên tâm vào việc mình, không cuốn vào tranh giành phe phái là thượng sách.",
        "love": "Lục Bạch tinh động, người có bạn đời thích hợp bàn chuyện hôn nhân, kế hoạch sinh con. Người độc thân đào hoa hỗn tạp, cần phân định rõ chân tâm và giả ý.",
        "health": "Hỏa Thổ khô nóng, chú ý da dẻ và rối loạn nội tiết, tâm trạng dễ bồn chồn cáu gắt. Nên tĩnh tâm điều dưỡng, các môn vận động nhẹ nhàng như thái cực, yoga rất phù hợp.",
        "dispute": "Tháng tam hình, chuyện cũ có thể bị khơi lại, hoặc có người đâm chọc sau lưng. Cây ngay không sợ chết đứng, không cần vội vã đôi co, thời gian tự chứng minh chân tướng."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên đào hoa mang lại tài lộc, quan hệ khách hàng duy trì tốt giúp khách cũ quay lại và giới thiệu thêm mối làm ăn. Là tháng hợp tác sinh tài.",
        "career": "Tam hợp quý nhân trợ lực, làm việc nhóm thuận buồm xuôi gió, dự án liên phòng ban tiến triển lý tưởng. Người có ý định chuyển việc có thể thông qua các mối quan hệ mà đón nhận cơ hội tốt.",
        "love": "Ngũ Hoàng tinh động, nhân duyên cực tốt, người độc thân tiệc tùng gặp gỡ liên miên, có cơ hội gặp đối tượng xứng đôi vừa lứa. Người có bạn đời cần đề phòng người ngoài can thiệp.",
        "health": "Thủy khí tăng dần, người Hàn Mệnh cảm thấy vô cùng khoan khoái, người Nhiệt Mệnh cần chú ý bảo dưỡng thận và hệ tiết niệu. Biện pháp giữ ấm nên chuẩn bị từ sớm.",
        "dispute": "Tháng tam hợp quý nhân nhiều hơn tiểu nhân, song đào hoa quá vượng dễ chuốc tin đồn thất thiệt, giao tiếp với đồng nghiệp khác giới giữ sự minh bạch công khai."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tứ Lục Văn Khúc tinh nhập trung cung, vì sức khỏe hoặc chuyện gia trạch mà có thể tăng chi tiêu, tài vận bình bình. Không nên cho người khác vay mượn, cũng chớ đứng ra bảo lãnh.",
        "career": "Tháng Hại Thái Tuế, tiến độ công việc tương đối chậm chạp, kế hoạch dễ gặp trắc trở đình trệ. Nên thao quang dưỡng hối, kiểm điểm lại được mất cả năm để chuẩn bị cho năm tới.",
        "love": "Tương hại ảnh hưởng sự thấu hiểu, với bạn đời dễ sinh hiểu lầm, lúc bày tỏ nên trực tiếp rõ ràng, kỵ để đối phương tự đoán. Người độc thân duyên phận mờ nhạt, chớ cưỡng cầu.",
        "health": "Tứ Lục Văn Khúc tinh đương lệnh, là tháng sức khỏe cần lưu tâm nhất trong năm, bệnh cũ dễ tái phát, người lớn tuổi và phụ nữ mang thai càng phải cẩn thận. Tránh đi thăm bệnh viếng tang.",
        "dispute": "Hại Thái Tuế chủ sự phá hoại ngấm ngầm sau lưng, lòng phòng người không thể thiếu, tài liệu quan trọng sao lưu, lời hứa miệng cố gắng xác nhận bằng văn bản."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tam Bích Lộc Tồn tinh nhập trung cung, tháng Tuế Phá tài vận trồi sụt, thưởng cuối năm hoặc phân hồng có thể có biến số. Chi tiêu cần kiểm soát chặt chẽ, dự trù vốn quay vòng cho năm mới.",
        "career": "Tuế Phá chủ biến động, cuối năm có thể có tin tức điều chỉnh nhân sự hay tái cơ cấu, chớ lo nghĩ quá nhiều, biến động có thể là bước ngoặt cho năm tới. Hoàn thành việc dở dang, không mở ván mới.",
        "love": "Tháng tương xung, tâm trạng khá dao động, với bạn đời dễ vì thu xếp lễ tết hay việc gia đình mà cãi cọ, thông cảm cho nhau là hơn. Người độc thân không nên vội vã bắt đầu tình cảm.",
        "health": "Năm hết tết đến, mệt mỏi thể xác lẫn tinh thần tích tụ, chú ý hệ miễn dịch suy giảm. Tam Bích chủ can khí uất kết, nên ngủ sớm, giảm bớt bia rượu tiếp khách.",
        "dispute": "Tháng Tuế Phá kết hợp Tam Bích thị phi là tháng cần khiêm nhường kín đáo nhất trong cả năm. Bất luận trên mạng hay đời thực, phát ngôn nên thận trọng, tránh xa đề tài nhạy cảm tranh cãi, bình an đón tết là trọng."
      }
    ],
    "yearSummary": "Người tuổi Mùi trong năm Bản Mệnh Trực Thái Tuế trải qua nhiều biến động và thử thách rèn luyện bản lĩnh. May mắn thay, ánh sáng của các cát tinh Thái Dương, Thiên Ất, Văn Xương và Tuế Giá luôn đồng hành soi đường dẫn lối. Bằng sự điềm đạm, không ngừng nâng cao chuyên môn, sống hòa ái và bao dung, bạn sẽ vượt qua năm tuổi một cách ngoạn mục, tích lũy nội lực thâm hậu cho những thành công rực rỡ mai sau."
  },
  "Thân": {
    "name": "Thân (Khỉ)",
    "chinese": "猴",
    "english": "Monkey",
    "icon": "🐵",
    "relation": "Bình Hòa",
    "relationBadge": "normal",
    "themeYear": "Thiên Đức Phúc Tinh • Thuận Buồm Xuôi Gió",
    "auspiciousStars": [
      "Thiên Đức",
      "Phúc Tinh",
      "Bát Tọa"
    ],
    "inauspiciousStars": [
      "Kiếp Sát",
      "Cô Thần",
      "Thiên Không",
      "Hối Khí"
    ],
    "overview": "Người tuổi Thân năm Đinh Mùi 2027 bước vào năm vận thế bình hòa, không xung không phạm Thái Tuế. Cung mệnh được các quý nhân tinh thượng cát là **Thiên Đức**, **Phúc Tinh**, **Bát Tọa** tề tựu che chở. Thiên Đức chủ về quý nhân trưởng bối nâng đỡ, Phúc Tinh mang lại cuộc sống êm đềm may mắn, Bát Tọa hỗ trợ danh tiếng và uy tín công sở tăng cao. Mặc dù có các hung tinh nhỏ như Kiếp Sát hay Cô Thần gây chút hao tổn chi tiêu hoặc cảm giác cô độc thoáng qua, song đại cục cả năm vẫn là thuận buồm xuôi gió, tài lộc và sự nghiệp đều trên đà tích lũy vững vàng.",
    "starsAnalysis": "Cát tinh có **Thiên Đức**, **Phúc Tinh**, **Bát Tọa**: Thiên Đức phùng hung hóa cát, Phúc Tinh chiếu mệnh giải trừ muộn phiền, Bát Tọa lợi cho thăng tiến thi cử. Hung tinh có **Kiếp Sát**, **Cô Thần**, **Thiên Không**, **Hối Khí**: Kiếp Sát nhắc nhở cẩn thận tài vật khi ra ngoài; Cô Thần dễ gây cảm giác cô đơn trống vắng, cần chủ động chia sẻ cùng người thân; Thiên Không cảnh báo kế hoạch dễ có biến số nhỏ, cần chuẩn bị phương án dự phòng; Hối Khí nhắc nhở giữ thái độ lạc quan trước các trục trặc nhỏ.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Giai đoạn cuối của chu kỳ Mộc Hỏa 2022-2027 vẫn rất có lợi cho Hàn Mệnh, năm Đinh Mùi Hỏa Thổ ấm áp tương sinh, hãy nắm bắt cơ hội để phát triển sự nghiệp và học tập, song nửa cuối năm nên chuẩn bị phương án bảo toàn cho chu kỳ sau.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Năm nay là năm bình ổn giữ gìn thành quả, Hỏa Thổ quá nóng không hợp mệnh, lấy tĩnh chế động, củng cố chuyên môn, việc đại sự chờ từ năm 2028 (vận Kim Thủy) tiến hành sẽ thuận lợi hơn.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Vận trình trung quy trung củ, làm việc chắc chắn, hòa ái với mọi người xung quanh thì cả năm êm ấm.",
    "birthYears": [
      {
        "year": 2016,
        "canChi": "Bính Thân",
        "age": "12 tuổi âm",
        "reading": "Tuổi nhỏ thông minh lanh lợi, học hỏi tiếp thu nhanh, cần rèn luyện tính kiên nhẫn tập trung và chăm sóc sức khỏe đường hô hấp."
      },
      {
        "year": 2004,
        "canChi": "Giáp Thân",
        "age": "24 tuổi âm",
        "reading": "Bắt đầu bước vào đời lập nghiệp, có sao Bát Tọa và Thiên Đức nâng đỡ, hãy tự tin thể hiện thực lực để tạo dựng uy tín ban đầu."
      },
      {
        "year": 1992,
        "canChi": "Nhâm Thân",
        "age": "36 tuổi âm",
        "reading": "Độ tuổi chín muồi sự nghiệp, tài lộc hanh thông, các dự án hợp tác thu về kết quả khả quan, gia đạo êm ấm thuận hòa."
      },
      {
        "year": 1980,
        "canChi": "Canh Thân",
        "age": "48 tuổi âm",
        "reading": "Vị thế công danh vững chắc, kinh tế dồi dào, cần phân bổ tài chính hợp lý và chú ý chăm sóc sức khỏe tim mạch."
      },
      {
        "year": 1968,
        "canChi": "Mậu Thân",
        "age": "60 tuổi âm",
        "reading": "Tuổi hoa giáp an nhàn, công việc dần chuyển giao thế hệ sau, tận hưởng cuộc sống thư thái bên con cháu hiếu thảo."
      },
      {
        "year": 1956,
        "canChi": "Bính Thân",
        "age": "72 tuổi âm",
        "reading": "Hưởng phúc thọ an khang, giữ nếp sinh hoạt điều độ, thường xuyên đi dạo nhẹ nhàng và giữ ấm cơ thể khi trời trở lạnh."
      },
      {
        "year": 1944,
        "canChi": "Giáp Thân",
        "age": "84 tuổi âm",
        "reading": "Đại thọ diên niên, gia đình hưng thịnh sum vầy, tâm hồn thanh thản trường thọ."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Tài vận tháng này bình bình, chính tài ổn định mà thiên tài không nên cưỡng cầu. Ngũ Hoàng Liêm Trinh tinh nhập trung cung, mầm mống tai bệnh tiềm ẩn, kỵ động thổ mạo hiểm.",
        "career": "Sự nghiệp là tháng tư tưởng học tập, nhịp độ công việc chưa quá gấp gáp, thích hợp trù hoạch đại kế cả năm. Cấp trên có ấn tượng khá tốt về bạn, chủ động thể hiện sẽ được ghi điểm cộng.",
        "love": "Đào hoa tinh động, người độc thân nhân duyên khá tốt, nơi xã giao dễ có cơ duyên tao ngộ, song thành ý của đối phương cần thời gian quan sát. Người có bạn đời hòa thuận, việc nhỏ không cần tính toán.",
        "health": "Sức khỏe không có gì đáng ngại, song đầu xuân hàn ẩm chưa tan, ăn uống nên thanh đạm, người tỳ vị yếu cần lưu ý.",
        "dispute": "Nhân duyên tuy tốt song nói nhiều tất hớ, tán gẫu công sở không nên chạm vào đời tư người khác thì có thể tránh được khẩu thiệt vô cớ."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tháng Dịch Mã tài vận làm nhiều hưởng nhiều, ra ngoài công tác hoặc khách hàng phương xa mang lại thu nhập thêm. Song chi tiêu tăng theo hành trình, cần dự trù chu toàn.",
        "career": "Tháng này đi lại thường xuyên, cơ hội công tác, hội nghị, khảo sát bên ngoài tăng lên, tuy vất vả nhọc nhằn song có lợi cho mở rộng tầm nhìn. Ngồi yên một chỗ thì tiến độ hạn chế.",
        "love": "Tháng tụ ít xa nhiều, người độc thân tình duyên nơi xa có cơ hội hơn, song phát triển lâu dài cần suy xét kỹ. Người có bạn đời nên tăng cường giao lưu, tránh sinh hiểu lầm.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, lợi cho học nghiệp thi cử văn thư, song cần lưu ý nghỉ ngơi điều độ tránh kiệt sức.",
        "dispute": "Đi lại nhiều thì thị phi ít, song lời ăn tiếng nói nơi đất khách cần thận trọng, nhập gia tùy tục thì tránh được xung đột."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tháng tam hình tài vận dao động, chính tài tạm vững, đầu tư mạo hiểm thì không nên. Tháng này dễ vì tình nghĩa mà có thêm chi tiêu, cho vay mượn bảo lãnh nhất thiết phải khéo léo từ chối.",
        "career": "Thái Tuế tam hình, áp lực công việc gia tăng, quan hệ đồng nghiệp căng thẳng, giấy tờ hợp đồng cần đối chiếu nhiều lần. Khiêm tốn hành sự, không cuốn vào phe phái thì tự bảo vệ được mình.",
        "love": "Tâm trạng dễ bị ngoại cảnh tác động, ở bên bạn đời kỵ hành động theo cảm tính. Người độc thân đào hoa đới hình, lai lịch người mới quen nên tìm hiểu nhiều hơn.",
        "health": "Tam Bích Lộc Tồn tinh nhập trung cung, cảm xúc trồi sụt khá lớn, ảnh hưởng chất lượng giấc ngủ. Nên tĩnh tâm điều dưỡng, tránh thức khuya.",
        "dispute": "Tháng này là đỉnh điểm thị phi của cả năm, tranh chấp khẩu thiệt khó tránh, nghe thấy điều gì cũng nên cười xòa cho qua, không nên vội vã phản bác."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Tài vận bình bình, dễ có hao tổn ngầm, đối chiếu sổ sách cần tỉ mỉ cẩn thận. Tháng này không nên hùn vốn làm ăn cùng người khác, tự mình quyết định ngược lại an toàn hơn.",
        "career": "Tháng tương hại nhân tế có sóng ngầm, bề ngoài hòa thuận song sau lưng có thể có lời bàn tán. Bàn giao công việc nên lưu lại văn bản ghi chép để tránh tranh cãi sau này.",
        "love": "Tình cảm dễ có hiểu lầm, việc nhỏ xé to, trò chuyện với bạn đời nên thẳng thắn trực tiếp, ngờ vực chỉ làm sâu thêm ngăn cách. Người độc thân không nên vội vã tỏ tình.",
        "health": "Nhị Hắc Cự Môn tinh nhập trung cung, Bệnh Phù đương lệnh cần đặc biệt chú ý sức khỏe.",
        "dispute": "Tháng ám hại, lòng phòng người không thể thiếu, đặc biệt là phát ngôn trên mạng xã hội càng phải thận trọng để giảm bớt rắc rối vô cớ."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Tháng Lục Hợp tài vận dần thông suốt, chính tài có khoản thu vào, thiên tài vẫn ở mức bình thường. Tháng này có lợi cho hợp tác làm ăn, song chi tiết điều khoản cần giấy trắng mực đen.",
        "career": "Ngọ Mùi lục hợp, quý nhân công sở xuất hiện, việc ấp ủ bấy lâu tháng này có thể có bước đột phá. Chủ động tranh thủ thể hiện, cấp trên sẽ nhìn nhận thấu đáo.",
        "love": "Tháng Đào Hoa vận tình cảm tốt nhất, người độc thân dễ gặp đối tượng ưng ý, tốc độ tiến triển có thể điều tiết theo ý mình. Người có bạn đời ngọt ngào êm ấm, nên dành thời gian bên nhau.",
        "health": "Nhất Bạch Tham Lang tinh nhập trung, nhân duyên đào hoa vượng nhưng cần tránh hoạt động nguy hiểm cao, đi đứng lưu ý dưới chân để bình an trôi qua.",
        "dispute": "Nhân duyên tốt thì thị phi tránh xa, giao tế tiệc tùng tuy nhiều song uống rượu nên chừng mực, tránh vì lỡ lời mà chuốc họa."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Tháng tương xung tiền đến rồi đi, chính tài không vững, chi tiêu bất ngờ dễ xuất hiện. Tháng này nên giữ chặt tiền mặt, dự phòng ngân sách ứng cấp, không nên quyết định tài chính lớn.",
        "career": "Mùi Thân tương xung mang khí biến động, điều chỉnh vị trí hay tái cơ cấu tổ chức có thể xuất hiện. Thuận thế ứng biến, không nên đối kháng cứng nhắc, tin rằng bước ngoặt ở phía sau.",
        "love": "Tháng tương xung cảm xúc dao động, với bạn đời dễ sinh cãi cọ, lùi một bước biển rộng trời cao. Người độc thân tình cảm không nên cưỡng cầu, thuận theo tự nhiên là hơn.",
        "health": "Cửu Tử Hữu Bật tinh nhập trung cung, hỷ khánh đào hoa lâm môn nhưng cần chú ý sức khỏe hệ hô hấp.",
        "dispute": "Tháng biến động thị phi khó tránh, bất kể gặp chuyện gì hãy bình tĩnh xử lý, phản ứng kích động chỉ làm sự tình thêm phức tạp."
      },
      {
        "month": "Tháng Bảy (戊申 - Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này tài vận hồi phục ổn định, chính tài dần đi vào quỹ đạo, sóng gió tháng trước đã qua. Bát Bạch Tả Phụ tinh nhập trung cung đại lợi tài vận, song đồ quý giá vẫn cần lưu tâm bảo quản.",
        "career": "Tháng bình ổn nhịp độ công việc trở lại bình thường, không áp lực lớn cũng không có đột phá lớn. Thích hợp tổng kết được mất nửa đầu năm, điều chỉnh bước đi nửa cuối năm.",
        "love": "Tình cảm êm ả như nước, người độc thân đào hoa chưa hiển lộ, nên tận hưởng sự tĩnh lặng. Người có bạn đời chung sống thuận hòa, chút bất ngờ nhỏ sẽ thêm hương vị.",
        "health": "Thân nguyệt cùng bản mệnh đồng khí, thể lực khá tốt, song Thất Xích chủ bất ngờ, vận động hay lái xe cần tập trung tinh thần, không được sơ suất.",
        "dispute": "Tháng bình ổn thị phi tự nhiên tiêu tan, không chủ động gây sự thì không có chuyện gì, tiếp tục hành xử khiêm nhường là được."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Thất Xích Phá Quân tinh nhập trung cung, tháng này là tháng tài vận khá tốt trong năm. Cả chính tài lẫn thiên tài đều có thu hoạch, kế hoạch ấp ủ có thể thực thi đúng lúc, song cần phòng phá tài, thấy tốt thu tay.",
        "career": "Vận sự nghiệp đi lên cùng tài vận, biểu hiện công việc được ghi nhận, cơ hội tăng lương thăng chức có thể xuất hiện. Không nên vì thế mà tự mãn, khiêm tốn thì con đường càng dài rộng.",
        "love": "Tài vận hanh thông kéo theo tâm trạng phấn chấn, ở bên bạn đời hòa thuận êm ấm. Người độc thân dễ thu hút ánh nhìn nơi giao tế xã hội, chủ động hay không tùy tâm.",
        "health": "Sức khỏe bình ổn, tinh thần dồi dào, song tiệc tùng chúc tụng tăng lên, cần chú ý cân nặng và gánh nặng tỳ vị dạ dày.",
        "dispute": "Vận may đang lên càng kỵ phô trương, giải quyết chuyện vui một cách kín đáo thì tránh được người khác ghen tị."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Tháng tam hình tài vận trồi sụt, vận may tháng trước khó tiếp nối. Đầu tư cần thấy tốt thu tay, nảy lòng tham ắt chuốc tổn thất.",
        "career": "Sóng ngầm công sở tái hiện, đồng nghiệp cạnh tranh công khai hoặc ngấm ngầm, thành quả công việc nên kịp thời báo cáo cấp trên để tránh bị người khác cướp công.",
        "love": "Cảm xúc chịu ảnh hưởng của thị phi, ở bên bạn đời dễ sinh ma sát. Người độc thân người mới quen có thể dính líu quan hệ phức tạp, tìm hiểu sâu rồi hãy tính.",
        "health": "Lục Bạch Vũ Khúc tinh nhập trung, vị thế thiên tài có lợi, song cần chú ý điều dưỡng tâm thần, tránh mất ngủ.",
        "dispute": "Tháng này là đỉnh điểm thị phi thứ hai trong năm, tương ứng với tháng Ba âm lịch. Bất luận ở công sở hay đời sống, nói ít làm nhiều là thượng sách."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Thân Tý Thìn tam hợp, tháng này tài vận thuận buồm xuôi gió, đặc biệt có lợi cho hợp tác đội nhóm hoặc đầu tư tập thể. Nhân mạch mang lại thương cơ, khéo tận dụng ắt có thu hoạch.",
        "career": "Tháng tam hợp vận quý nhân mạnh, quan hệ với đồng nghiệp cấp dưới hòa thuận, dự án xúc tiến trôi chảy. Nếu có kế hoạch chuyển việc, tháng này có thể tích cực tìm kiếm.",
        "love": "Nhân duyên tốt kéo theo vận tình cảm, người độc thân qua bạn bè giới thiệu dễ có đối tượng phù hợp. Người có bạn đời nên cùng tham gia các mối quan hệ bạn bè của nhau để tăng sự thấu hiểu.",
        "health": "Ngũ Hoàng Liêm Trinh tinh nhập trung cung, mầm tai bệnh tiềm ẩn kỵ động thổ mạo hiểm, tiệc tùng xã giao nhiều cần sinh hoạt có tiết chế.",
        "dispute": "Tháng tam hợp người hòa khí thuận, thị phi tự nhiên tránh xa. Song vẫn cần đề phòng kẻ tiểu nhân, thân sơ phân định rõ ràng thì không lo sơ suất."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tháng Hại Thái Tuế tài vận sóng ngầm, bề ngoài bình lặng song thực tế có nỗi lo ngầm. Sổ sách cần đối chiếu tỉ mỉ, điều khoản hợp đồng không thể nhẹ dạ tin lời hứa miệng.",
        "career": "Công sở dễ có trở ngại ngấm ngầm, kế hoạch xúc tiến chậm hơn dự kiến. Giữ sự kiên nhẫn, tin rằng trắc trở chỉ là tạm thời, cuối năm tự có bước chuyển.",
        "love": "Tháng tương hại tình cảm dễ có hiểu lầm, trao đổi với bạn đời cần thêm phần kiên nhẫn. Người độc thân không nên vội vàng phát triển, quan sát là hơn.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, lợi cho học tập văn thư thi cử, chú ý giữ ấm thân thể trong mùa đông giá rét.",
        "dispute": "Tháng Hại Thái Tuế thị phi ngầm sinh mà khó phát giác. Lời ăn tiếng nói cẩn trọng, không bàn tán chuyện người khác thì giảm thiểu tai họa vô cớ."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tháng Tuế Phá tài vận chao đảo, là thời điểm cần thận trọng nhất trong cả năm. Chi tiêu cuối năm vốn nhiều, càng cần lượng sức mà chi, cho vay mượn tuyệt đối không nên.",
        "career": "Sửu Mùi tương xung mang khí Tuế Phá, chốn công sở có thể có biến động đột xuất, tổng kết cuối năm hoặc điều chỉnh nhân sự đều có thể diễn ra. Giữ tâm bất biến giữa dòng đời vạn biến, thuận thế mà làm.",
        "love": "Tháng tương xung cảm xúc bất ổn nhất, với bạn đời dễ vì việc nhỏ mà tranh cãi, nhẫn nhịn là thượng sách. Người độc thân không nên bắt đầu tình cảm mới trong tháng Tuế Phá.",
        "health": "Tam Bích thị phi nhập trung cung, cảm xúc ảnh hưởng sức khỏe, mất ngủ hoặc đau đầu có thể xuất hiện. Nên ngủ sớm, giảm bớt hoạt động ban đêm.",
        "dispute": "Tháng Tuế Phá là cửa ải cuối cùng của cả năm, tranh chấp thị phi có thể tập trung xuất hiện. Bất kể gặp chuyện gì, nhẫn nhịn nhất thời gió yên biển lặng, đợi sau tiết Lập Xuân tự có bầu trời mới thênh thang."
      }
    ],
    "yearSummary": "Người tuổi Thân năm Đinh Mùi đại thể bình ổn, đón nhận nhiều cát khí tốt lành từ bộ ba cát tinh Thiên Đức, Phúc Tinh, Bát Tọa. Chỉ cần duy trì phong độ làm việc chắc chắn, tránh các cuộc đầu cơ mạo hiểm và giữ gìn các mối quan hệ xã giao chân thành, bạn sẽ có một năm gặt hái nhiều thành quả rực rỡ và bình an trọn vẹn."
  },
  "Dậu": {
    "name": "Dậu (Gà)",
    "chinese": "雞",
    "english": "Rooster",
    "icon": "🐔",
    "relation": "Bình Hòa",
    "relationBadge": "normal",
    "themeYear": "Đường Phù Địa Giải • Tích Lũy Vững Vàng",
    "auspiciousStars": [
      "Đường Phù",
      "Địa Giải",
      "Nguyệt Đức"
    ],
    "inauspiciousStars": [
      "Tiểu Hao",
      "Tử Phù",
      "Kiếp Sát"
    ],
    "overview": "Người tuổi Dậu năm Đinh Mùi 2027 bước vào năm vận thế bình hòa, không xung không phạm Thái Tuế. Trong cung mệnh có cát tinh **Đường Phù** chủ về quyền lực và uy vọng, đặc biệt có lợi cho người làm công tác quản lý, lãnh đạo hoặc làm trong ngành kỷ luật, hành chính; **Địa Giải** có năng lực hóa giải một phần hung hiểm, phùng hung hóa cát; **Nguyệt Đức** quý nhân tinh chiếu mệnh, mang lại sự trợ lực lớn từ nữ quý nhân. Tuy nhiên có các hung tinh nhỏ như Tiểu Hao, Tử Phù, Kiếp Sát: Tiểu Hao chủ hao tài nhẹ, chi tiêu nhiều hơn năm ngoái; Tử Phù nhắc nhở quan tâm sức khỏe trưởng bối; Kiếp Sát phòng kẻ tiểu nhân ngầm tranh đoạt lợi ích, việc hợp tác cần cẩn trọng.",
    "starsAnalysis": "Cát tinh có **Đường Phù**, **Địa Giải**, **Nguyệt Đức**: Đường Phù củng cố quyền uy và tầm ảnh hưởng nơi công sở; Địa Giải gỡ rối lúc khó khăn; Nguyệt Đức mang lại nhân duyên hòa nhã và sự nâng đỡ quý báu. Hung tinh có **Tiểu Hao**, **Tử Phù**, **Kiếp Sát**: Tiểu Hao cảnh báo các khoản tiền vụn vặt hao tán; Kiếp Sát nhắc nhở cẩn thận hợp đồng pháp lý; Tử Phù khuyên nên chú ý sức khỏe người lớn tuổi trong gia đình.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Giai đoạn cuối của chu kỳ Mộc Hỏa 2022-2027 vẫn thuận lợi cho Hàn Mệnh, năm Đinh Mùi Hỏa Thổ ấm áp tương sinh, hãy tranh thủ cơ hội để hoàn tất các dự định công việc, tài lộc hanh thông.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Hỏa Thổ khô nóng không có lợi cho Nhiệt Mệnh, vận thế khó có đột phá lớn, nên dĩ tĩnh chế động, tập trung vào chuyên môn hiện tại, bổ sung yếu tố Thủy (hướng Tây Bắc, màu đen, lam, trắng, xám) để điều hòa sinh khí, chờ đợi chu kỳ Kim Thủy từ năm 2028.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Vận trình trung quy trung củ, làm việc chắc chắn, hòa ái với mọi người xung quanh thì một năm trôi qua bình an.",
    "birthYears": [
      {
        "year": 2017,
        "canChi": "Đinh Dậu",
        "age": "11 tuổi âm",
        "reading": "Bé chăm ngoan hiếu học, tính tình hoạt bát thông minh, cha mẹ cần chú ý bảo vệ mắt và đường hô hấp, tạo thói quen sinh hoạt điều độ."
      },
      {
        "year": 2005,
        "canChi": "Ất Dậu",
        "age": "23 tuổi âm",
        "reading": "Đang độ học tập hoặc mới bước vào đời, có Đường Phù và Nguyệt Đức nâng đỡ, hãy tự tin thể hiện tài năng để xây dựng nền tảng vững chắc."
      },
      {
        "year": 1993,
        "canChi": "Quý Dậu",
        "age": "35 tuổi âm",
        "reading": "Sự nghiệp đang trên đà khẳng định vị trí, thu nhập tài chính ổn định, hợp tác làm ăn cần giấy trắng mực đen rõ ràng để tránh tổn thất."
      },
      {
        "year": 1981,
        "canChi": "Tân Dậu",
        "age": "47 tuổi âm",
        "reading": "Vị thế công danh vững vàng, tài chính tích lũy tốt, cần chú ý chăm sóc sức khỏe tim mạch và cân bằng giữa công việc và nghỉ ngơi."
      },
      {
        "year": 1969,
        "canChi": "Kỷ Dậu",
        "age": "59 tuổi âm",
        "reading": "Tài vận bình bình, đầu tư quản lý tài chính lấy bảo thủ làm hay, chú ý bảo dưỡng gan mật và đường hô hấp, gia đình hòa thuận là phúc."
      },
      {
        "year": 1957,
        "canChi": "Đinh Dậu",
        "age": "71 tuổi âm",
        "reading": "Tuổi đã cổ hy, sức khỏe là trọng yếu, lưu niên bình thường không có đại tật tương xâm, sinh hoạt quy củ, con cháu hiếu thảo an vui."
      },
      {
        "year": 1945,
        "canChi": "Ất Dậu",
        "age": "83 tuổi âm",
        "reading": "Bát tuần hưởng thọ, vận trình bình lặng là phúc trạch, đề phòng trượt ngã va chạm, lưu ý tỳ vị tiêu hóa, tâm cảnh an thái trường thọ."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Chính tài bình ổn, thiên tài chưa thấy khởi sắc. Tháng này Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên tốt mà tài vận bình thường, kế hoạch đầu tư nên quan sát thêm, không nên vội vàng triển khai. Chi tiêu cho việc học tập hoặc tiếp khách khá nhiều, thuộc khoản chi cần thiết.",
        "career": "Kế hoạch mới đang thai nghén, công việc chưa quá khẩn trương. Thích hợp tham gia các khóa học nâng cao chuyên môn, cấp trên có thiện cảm, biểu hiện khiêm tốn sẽ giành được hảo cảm.",
        "love": "Đào hoa tinh động, người độc thân nơi xã giao có cơ hội quen đối tượng mới, song thành ý của đối phương cần quan sát. Người có bạn đời tình cảm bình ổn, tránh vì việc vặt mà tranh cãi.",
        "health": "Đầu xuân còn lạnh, chú ý đường hô hấp và chứng dị ứng, người có bệnh cũ cần lưu tâm giữ ấm. Ăn uống điều độ, tránh tiệc tùng quá độ tổn hại dạ dày.",
        "dispute": "Tháng này thị phi tương đối ít, song vui vẻ tiệc tùng kỵ nói nhiều, không bàn tán đời tư người khác thì tránh được phiền toái."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tượng động trung cầu tài, ra ngoài công tác hoặc khách hàng phương xa mang lại cơ hội kiếm tiền. Song chi tiêu đi lại tăng lên, cần trù tính dự toán.",
        "career": "Cơ hội biến động công việc nổi lên, có khả năng công tác, khảo sát hoặc điều chuyển vị trí ngắn hạn. Chủ động tranh thủ thì có thành quả, ngồi yên một chỗ thì tiến độ hạn chế.",
        "love": "Tụ ít xa nhiều, người độc thân tình duyên nơi xa có cơ hội nảy mầm. Người có bạn đời cần duy trì liên lạc thường xuyên, tránh vì xa cách sinh lạnh nhạt.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, lợi cho học tập văn thư thi cử, song đi lại mệt mỏi dễ kiệt sức, chú ý vệ sinh ăn uống.",
        "dispute": "Đi lại nhiều thì thị phi ít, song lời ăn tiếng nói nơi đất khách cần thận trọng, tôn trọng tập quán địa phương thì tránh được va chạm."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tài vận trồi sụt, chính tài tạm vững, thiên tài chớ đụng. Tháng này Tam Bích Lộc Tồn tinh nhập trung cung, dễ chuốc khẩu thiệt, giao dịch tài chính cố gắng lưu lại chứng từ rõ ràng.",
        "career": "Thái Tuế tam hình, sóng ngầm công sở dập dềnh, với đồng nghiệp cấp trên dễ nảy sinh bất đồng quan điểm. Khiêm nhường làm việc, hoàn thành bổn phận là thượng sách.",
        "love": "Cảm xúc dao động khá lớn, dễ vì chuyện nhỏ mà cãi cọ, ở bên bạn đời cần bao dung nhiều hơn. Người độc thân đào hoa đới kiếp, chớ vội lún sâu.",
        "health": "Thổ Mộc giao chiến, tỳ vị đường ruột khá yếu, ăn uống thanh đạm là hợp. Áp lực tâm lý dễ gây mất ngủ, vận động thích hợp giúp giải tỏa.",
        "dispute": "Tam Bích thị phi tinh nhập trung cung, tháng này là đỉnh điểm thị phi của năm. Nói ít làm nhiều, tránh xa tranh chấp của người khác để tự bảo vệ mình."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Chính tài bình ổn, thu nhập ngoài luồng chưa có. Tháng này Nhị Hắc Cự Môn tinh nhập trung cung, lợi cho việc dùng chuyên môn kiếm thù lao, đầu cơ mạo hiểm tuyệt đối không nên.",
        "career": "Tháng tương hại tiểu nhân ngầm ẩn, thành quả công việc có thể bị người khác dòm ngó. Tài liệu quan trọng sao lưu cất giữ, lời hứa miệng không thể tin hết.",
        "love": "Tương hại cũng chủ về tình cảm có sóng ngầm, người độc thân dễ gặp đối tượng mập mờ không rõ ràng. Người có bạn đời cần thẳng thắn, nghi kỵ sẽ sinh vết nứt.",
        "health": "Tổng thể không có gì đáng ngại, chú ý mắt mỏi mệt và ngồi sai tư thế gây đau mỏi vai gáy. Người làm văn phòng nên định kỳ đứng dậy vận động.",
        "dispute": "Tháng tương hại thị phi ngầm ẩn, lòng phòng người không thể thiếu. Giữ khoảng cách với chính trị công sở, không nhẹ dạ tin lời đồn."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Tài vận dần vào cảnh đẹp, chính tài có không gian tiến bộ. Tháng này Nhất Bạch Tham Lang tinh nhập trung cung, mọi việc cẩn trọng, đại đầu tư hay cho vay mượn tạm hoãn.",
        "career": "Lục Hợp quý nhân trợ lực, dự án hợp tác tiến triển thuận lợi. Cấp trên công nhận biểu hiện của bạn, song Ngũ Hoàng đương lệnh, quyết định trọng đại nên đợi tháng sau.",
        "love": "Tháng Đào Hoa duyên khác phái rất tốt, người độc thân nắm bắt cơ hội mở rộng giao tế. Người có bạn đời tình cảm thắm thiết, thích hợp bàn bạc kế hoạch tương lai.",
        "health": "Ngũ Hoàng chủ tai bệnh, tránh hoạt động nguy hiểm cao. Chú ý tim mạch và huyết áp, người cao tuổi đặc biệt lưu tâm.",
        "dispute": "Vận nhân duyên tốt, thị phi tương đối ít. Song đào hoa quá vượng dễ chiêu mời tin đồn mập mờ, lời nói cử chỉ đoan chính tránh chuốc hiểu lầm."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Tài vận dao động, dễ có chi tiêu ngoài ý muốn. Tháng này Cửu Tử Hữu Bật tinh nhập trung cung, lợi cho tài vận, song tháng tương xung tiền đến rồi đi, tích lũy là thượng sách.",
        "career": "Tháng biến động, điều chỉnh cơ cấu công ty hay biến động nhân sự ảnh hưởng tâm trạng. Giữ sự linh hoạt đàn hồi, bất luận môi trường biến hóa ra sao thái độ chuyên nghiệp là gốc rễ lập thân.",
        "love": "Tương xung ảnh hưởng cảm xúc, dễ nảy sinh tranh cãi với bạn đời. Người độc thân tháng này không nên đưa ra quyết định tình cảm trọng đại, bình tĩnh là hơn.",
        "health": "Xung tất động, chú ý an toàn giao thông và trật khớp tay chân. Người lái xe tập trung tinh thần, tránh vội vã chạy xe.",
        "dispute": "Tháng tương xung thị phi khá nhiều, hành sự khiêm tốn kín đáo. Cuộc họp quan trọng hay đàm phán nên chuẩn bị sẵn phương án dự phòng, phòng ngừa biến cố bất ngờ."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Tài vận hồi phục ổn định, những sóng gió tháng trước dần lắng dịu. Tháng này Bát Bạch Tả Phụ tinh nhập trung cung, phòng phá tài, đồ quý giá bảo quản cẩn mật, tránh để lộ của cải.",
        "career": "Nhịp độ công việc trở lại bình thường, hiệu suất nâng cao. Tháng bình ổn thích hợp thu xếp tiến độ nửa đầu năm, điều chỉnh kế hoạch nửa cuối năm.",
        "love": "Tình cảm bình đạm là chân thật, người có bạn đời tận hưởng cuộc sống đời thường. Người độc thân duyên phận chưa tới, cưỡng cầu vô ích.",
        "health": "Thất Xích chủ phổi và hệ hô hấp, tiết thu sắp tới chú ý giữ ấm. Khi chất lượng không khí kém nên giảm bớt vận động ngoài trời.",
        "dispute": "Tháng bình ổn thị phi không nhiều, Thất Xích chủ trộm cắp và kiện tụng, giấy tờ pháp lý xử lý cẩn thận, không tham của phi nghĩa."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Tháng này Thất Xích Phá Quân tinh nhập trung cung, đại lợi tài vận, là tháng tài vận khá tốt trong cả năm của tuổi Dậu. Cả chính tài lẫn thiên tài đều có cơ hội vào túi, song vẫn cần lượng sức mà chi.",
        "career": "Vận sự nghiệp đi lên cùng tài vận, biểu hiện được cấp trên khẳng định. Nếu có cơ hội thăng tiến hoặc điều chuyển chức vụ, tháng này tích cực tranh thủ sẽ nắm phần thắng cao hơn.",
        "love": "Tháng bình ổn tình cảm không sóng gió, người có bạn đời quan hệ hòa hợp. Người độc thân qua công việc có thêm cơ hội quen biết đối tượng.",
        "health": "Sức khỏe tổng thể tốt, Thất Xích nhập trung lưu ý tỳ vị tiêu hóa. Ăn uống đúng giờ, ăn uống quá độ dễ dẫn tới khó chịu.",
        "dispute": "Vận trình thuận lợi thị phi tương đối ít, song khi tài vận tốt dễ chuốc người ghen ghét, khiêm tốn kín đáo tránh tạo thêm kẻ thù."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Tài vận hồi lạc, đầu tư thấy tốt thu tay. Tháng này Lục Bạch Vũ Khúc tinh nhập trung cung, hỷ khánh đào hoa, chi tiêu cho tiệc tùng hoặc quà cáp khá nhiều.",
        "career": "Tháng tam hình áp lực công sở nặng nề, trao đổi với cấp trên hoặc khách hàng dễ sinh bất hòa cọ xát. Nhẫn nhịn một lúc gió yên biển lặng, không nên tranh hơn thua nhất thời.",
        "love": "Lục Bạch Vũ Khúc nhập trung có lợi cho thiên tài và địa vị, người có bạn đời dễ vì bận rộn tiếp khách mà lơ là đối phương, cần cân bằng thời gian.",
        "health": "Hỏa Thổ khô nóng, da dẻ và cổ họng dễ khó chịu. Uống nhiều nước, bớt đồ chiên rán, chú ý quy luật sinh hoạt nghỉ ngơi.",
        "dispute": "Tam hình cộng hưởng Cửu Tử, trong hỷ khánh ngầm chứa thị phi. Tham dự hỷ sự của người khác chớ nên tranh nổi bật, lời ăn tiếng nói cẩn thận tránh chuốc hiểu lầm."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Tam hợp quý nhân trợ lực, tài vận dần khởi sắc. Tháng này Ngũ Hoàng Liêm Trinh tinh nhập trung cung, nhân duyên đào hoa, tiếp khách thương vụ mang lại thương cơ.",
        "career": "Vận quý nhân tốt, khách hàng cũ hoặc đồng nghiệp cũ đem lại cơ hội hợp tác. Nắm bắt tài nguyên nhân mạch, quan hệ mới hay cũ đều nên duy trì vun đắp.",
        "love": "Ngũ Hoàng tái lâm, người độc thân duyên khác giới tiếp tục khởi sắc. Người có bạn đời tình cảm vững vàng, thích hợp ra mắt gia đình hai bên.",
        "health": "Thủy khí tăng vượng, người Hàn Mệnh cảm thấy vô cùng thoải mái. Người Nhiệt Mệnh chú ý tay chân lạnh, bổ sung thực phẩm ấm nóng vừa độ.",
        "dispute": "Tháng tam hợp nhân duyên hòa hợp, thị phi tương đối ít. Song tiệc tùng tăng lên, lời ăn tiếng nói sau khi uống rượu cần tự giác kỷ luật."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tài vận bình bình, dễ vì chuyện nhân tình thế thái mà hao tài. Tháng này Tứ Lục Văn Khúc tinh nhập trung cung, chú ý sức khỏe đồng thời chi phí y tế hoặc bồi dưỡng tăng lên.",
        "career": "Tháng Hại Thái Tuế, tiểu nhân công sở ngấm ngầm xuất hiện. Thành quả công việc có thể bị người khác tranh công hoặc hiểu lầm, lưu giữ hồ sơ công việc, kịp thời phản ánh lên cấp trên.",
        "love": "Tương hại ảnh hưởng sự tin tưởng, người có bạn đời dễ sinh ngờ vực. Người độc thân đối tượng mới quen lai lịch chưa rõ, không nên dốc hết lòng quá nhanh.",
        "health": "Tứ Lục Văn Khúc tinh đương lệnh, vấn đề đường ruột và phụ khoa dễ phát sinh. Vệ sinh ăn uống đặc biệt chú ý, tránh đồ sống lạnh.",
        "dispute": "Tháng Hại Thái Tuế thị phi ngầm ẩn, lòng phòng người không thể thiếu. Không nhẹ dạ tin lời hứa hẹn, hiệp nghị quan trọng phải giấy trắng mực đen rõ ràng."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tháng Tuế Phá tài vận trồi sụt, hoa hồng tiền thưởng cuối năm có thể bị chậm trễ. Tháng này Tam Bích Lộc Tồn tinh nhập trung cung, phòng ngừa khẩu thiệt thị phi, tranh chấp tài chính càng phải tránh.",
        "career": "Cuối năm công việc dồn dập áp lực lớn, tháng Tuế Phá nhiều biến số. Dự án trọng đại sớm thu xếp, dự trù thời gian co giãn ứng phó bất ngờ.",
        "love": "Tương xung ảnh hưởng cảm xúc, áp lực ngày lễ dễ châm ngòi tranh cãi. Người có bạn đời thông cảm cho nhau, người độc thân đối diện áp lực giục cưới cứ giữ tâm thái an nhiên.",
        "health": "Tháng Tuế Phá chú ý bệnh cũ tái phát, đặc biệt là khớp xương và lưng. Tiếp khách cuối năm nhiều, uống rượu chừng mực là thỏa đáng.",
        "dispute": "Tuế Phá kết hợp Tam Bích thị phi, thị phi cuối năm khó tránh. Không tranh biện đôi co, hoàn thành công việc rồi bình an đón tết, chuẩn bị đón chào năm mới khởi sắc."
      }
    ],
    "yearSummary": "Người tuổi Dậu năm Đinh Mùi đại thể bình ổn, đón nhận nguồn năng lượng vững chắc từ Đường Phù và Địa Giải. Dù có các tháng hao tổn nhỏ song đại cục tài lộc và sự nghiệp vẫn trên đà tích lũy. Cứ chuyên tâm vào chuyên môn, thận trọng trong giao dịch tài chính, giữ gìn hòa khí trong gia đình và công sở, bạn sẽ có một năm trôi qua an lành, phúc lộc dồi dào."
  },
  "Tuất": {
    "name": "Tuất (Chó)",
    "chinese": "狗",
    "english": "Dog",
    "icon": "🐶",
    "relation": "Hình Thái Tuế",
    "relationBadge": "tai",
    "themeYear": "Hình Thái Tuế • Nhẫn Nại Vượt Khó",
    "auspiciousStars": [
      "Thiên Đức",
      "Nguyệt Đức",
      "Phúc Tinh",
      "Bát Tọa"
    ],
    "inauspiciousStars": [
      "Quyển Thiệt",
      "Giao Sát",
      "Quả Tú",
      "Phi Ma"
    ],
    "overview": "Người tuổi Tuất năm Đinh Mùi 2027 bước vào năm **Hình Thái Tuế** (Tuất Mùi tương hình / Tuất Mùi tương phá), thuộc cục diện Trì Thế Chi Hình (tam hình Tuất Sửu Mùi). Hình tượng trưng cho sự cản trở, ma sát nhân sự, dễ vướng vào khẩu thiệt thị phi hoặc tranh chấp hợp đồng nếu không cẩn thận. Tuy nhiên, năm nay tuổi Tuất lại được chư vị đại cát tinh **Thiên Đức**, **Nguyệt Đức**, **Phúc Tinh**, **Bát Tọa** tề tựu soi chiếu, đem lại nguồn năng lượng phùng hung hóa cát cực kỳ mạnh mẽ, khó khăn đến mấy cũng có quý nhân xuất hiện giải trừ kịp thời. Phương châm vàng là 'thủ tĩnh nhẫn nại, giấy trắng mực đen, dĩ hòa vi quý'.",
    "starsAnalysis": "Cát tinh có **Thiên Đức**, **Nguyệt Đức**, **Phúc Tinh**, **Bát Tọa**: Thiên Đức và Nguyệt Đức hóa giải phần lớn hung hiểm tai ương; Phúc Tinh mang lại tâm cảnh bình an; Bát Tọa củng cố danh tiếng địa vị. Hung tinh có **Quyển Thiệt**, **Giao Sát**, **Quả Tú**, **Phi Ma**: Quyển Thiệt chủ khẩu thiệt thị phi đàm tiếu; Giao Sát cảnh báo hao tài tốn của trong giao dịch; Quả Tú dễ mang lại cảm xúc cô đơn u buồn; Phi Ma nhắc nhở lưu tâm chăm sóc sức khỏe người già trong gia đạo.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ ấm áp vẫn có lợi thế cho Hàn Mệnh, tuy có Hình Thái Tuế gây chút áp lực công việc song cơ hội làm ăn vẫn dồi dào. Hãy cẩn trọng trong các điều khoản hợp đồng để gặt hái thành quả vững chắc.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Hỏa Thổ trùng điệp lại gặp Hình Thái Tuế khiến Nhiệt Mệnh rất dễ nóng giận bồn chồn. Cần tăng cường yếu tố Thủy (hướng Tây Bắc, màu đen, lam, trắng, xám) để hạ nhiệt tâm trí, giữ hòa khí thì vạn sự an.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Nhịp độ công việc ổn định, kiên trì theo đuổi con đường chính đạo, không nên dính líu đến các việc thị phi kiện tụng.",
    "birthYears": [
      {
        "year": 2018,
        "canChi": "Mậu Tuất",
        "age": "10 tuổi âm",
        "reading": "Bé chăm ngoan thông minh, gia đình yêu thương bảo bọc, phụ huynh chú ý kiên nhẫn khích lệ tinh thần và phòng ngừa va chạm trầy xước khi nô đùa."
      },
      {
        "year": 2006,
        "canChi": "Bính Tuất",
        "age": "22 tuổi âm",
        "reading": "Bước vào giai đoạn lập thân hoặc tốt nghiệp, có sao Bát Tọa nâng đỡ, hãy tự tin rèn luyện kỹ năng chuyên môn, tránh để chuyện tình cảm bồng bột ảnh hưởng chí hướng."
      },
      {
        "year": 1994,
        "canChi": "Giáp Tuất",
        "age": "34 tuổi âm",
        "reading": "Độ tuổi khẳng định sự nghiệp, năm Hình Thái Tuế đòi hỏi sự tỉ mỉ trong các mối quan hệ đồng nghiệp và đối tác, văn bản hợp đồng rõ ràng thì công danh thăng tiến vững vàng."
      },
      {
        "year": 1982,
        "canChi": "Nhâm Tuất",
        "age": "46 tuổi âm",
        "reading": "Trụ cột gia đình tài chính vững vàng, cần chú ý chăm sóc sức khỏe tỳ vị tiêu hóa và phân bổ ngân sách khoa học, không tham gia đầu cơ lướt sóng."
      },
      {
        "year": 1970,
        "canChi": "Canh Tuất",
        "age": "58 tuổi âm",
        "reading": "Vị thế sự nghiệp ổn định, uy tín được tôn trọng, chuẩn bị chuyển giao thế hệ kế cận, giữ gìn giấc ngủ ngon và chăm sóc huyết áp."
      },
      {
        "year": 1958,
        "canChi": "Mậu Tuất",
        "age": "70 tuổi âm",
        "reading": "Tuổi hưu trí an nhàn, con cháu sum vầy hiếu thuận, chú ý giữ ấm xương khớp khi giao mùa và tập dưỡng sinh nhẹ nhàng."
      },
      {
        "year": 1946,
        "canChi": "Bính Tuất",
        "age": "82 tuổi âm",
        "reading": "Hưởng phúc an khang, tinh thần thanh thản vui vầy bên gia đình, thân tâm an lạc trường thọ."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Tháng này là khởi đầu năm mới, tài vận chưa thực sự sáng tỏ, không nên có hành động lớn. Nếu có kế hoạch đầu tư, nên nghiên cứu nhiều hơn, đợi thời cơ chín muồi hãy quyết định. Chính tài ổn định, chi tiêu sinh hoạt không phải lo nghĩ.",
        "career": "Tháng tư tưởng học tập, nơi công sở nên học thêm để nâng cao giá trị, mở đường cho tương lai. Cấp trên có ấn tượng khá tốt về bạn, song thể hiện chớ quá nóng vội kẻo chuốc ánh nhìn đố kỵ từ đồng nghiệp.",
        "love": "Ngũ Hoàng Liêm Trinh tinh nhập trung cung, mầm tai bệnh tiềm ẩn kỵ động thổ mạo hiểm, người đã có bạn đời tình cảm bình ổn, song dưới bóng Hình Thái Tuế ma sát nhỏ khó tránh, bao dung là hơn.",
        "health": "Dịp tết ăn uống nhiều món tạp, chú ý gánh nặng đường ruột dạ dày. Tháng này tinh thần khá tốt, sau tiệc tùng nên nghỉ ngơi sớm, chớ thức khuya quá mức.",
        "dispute": "Nhân duyên tuy tốt song nói nhiều tất hớ, trong các buổi tụ họp bớt bàn chuyện thị phi của người khác. Tin rằng khiêm tốn hành sự thì tháng này tránh được khẩu thiệt vô cớ."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tháng Dịch Mã tiền đến rồi đi, hoặc có cơ hội cầu tài nơi phương xa, song chi tiêu cũng theo đó mà tăng lên. Tháng này không nên cho người khác vay mượn kẻo tiền đi không trở lại.",
        "career": "Công việc có khả năng đi công tác hoặc điều chuyển vị trí, trong biến động ngầm chứa cơ hội. Song dưới bóng Hình Thái Tuế biến động chưa hẳn đã hoàn toàn như ý, cần chuẩn bị tâm lý vững vàng.",
        "love": "Người độc thân trong bước dịch chuyển có thể gặp đào hoa nơi xa, tiến triển nhanh chậm tùy thuộc sự đầu tư của đôi bên. Người có bạn đời tụ ít xa nhiều, vun vén tình cảm cần tốn thêm tâm sức.",
        "health": "Tứ Lục Văn Khúc tinh nhập trung, cảm cúm và bệnh đường ruột dễ bám theo. Ra vào nơi công cộng chú ý vệ sinh, sau hành trình dài cần nghỉ ngơi hồi phục đầy đủ.",
        "dispute": "Thân ở xứ người thị phi tương đối ít, song giao thiệp với người lạ giữ lại ba phần. Bất kể đối phương nhiệt tình ra sao, dính dáng tới chuyện tiền bạc đều phải cẩn trọng."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tháng này tài vận trồi sụt, đầu tư dễ phán đoán sai lầm. Quản lý tài chính bảo thủ là thượng sách, chớ nhẹ dạ tin lời người khác giới thiệu để tránh tổn thất.",
        "career": "Chốn công sở thị phi vây quanh, đồng nghiệp dễ sinh hiểu lầm. Xử lý công việc lưu lại văn bản ghi chép, lời hứa miệng không đủ làm căn cứ. Tin rằng cây ngay không sợ chết đứng, không cần vội thanh minh.",
        "love": "Tháng tam hình tình cảm chịu áp lực, với bạn đời dễ vì chuyện nhỏ mà tranh cãi. Người độc thân đào hoa đới kiếp, lai lịch người mới quen nên điều tra rõ ràng.",
        "health": "Cảm xúc dao động ảnh hưởng giấc ngủ, nên vận động nhiều hơn để giải tỏa áp lực. Bệnh cũ có dấu hiệu tái phát, cần sớm điều trị.",
        "dispute": "Tháng này là đỉnh điểm thị phi của cả năm, cẩn ngôn thận hạnh là mấu chốt. Bất kể nghe thấy tin đồn gì, chớ làm người truyền tin, tĩnh quan kỳ biến là an toàn nhất."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Tài vận dần đi vào ổn định, chính tài tăng trưởng nhẹ. Thiên tài giải trí nhỏ thì được, không nên đam mê. Tháng này có thể hao tài nhẹ xem như của đi thay người.",
        "career": "Văn Xương tinh trợ lực, thi cử học nâng cao thuận lợi. Văn thư công sở cần cẩn thận tỉ mỉ, tháng tương hại dễ có sai sót vô tâm, kiểm tra đối chiếu không thể thiếu.",
        "love": "Vận tình cảm bình bình, người độc thân tập trung vào học tập sự nghiệp là hơn. Người có bạn đời tháng tương hại dễ có hiểu lầm, thẳng thắn chia sẻ sẽ hóa giải được.",
        "health": "Sức khỏe không có gì đáng ngại, song dùng mắt quá độ dễ mỏi mệt. Người làm việc lâu bên máy tính nên định kỳ nghỉ ngơi thư giãn mắt.",
        "dispute": "Tháng tương hại sóng ngầm khá nhiều, tiểu nhân ngầm ngáng đường. Tin rằng cây ngay bóng thẳng, không cần quá lo lắng, cuối tháng thị phi tự tiêu tan."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Tháng Lục Hợp tài vận có lực trợ giúp, hoặc có tiền bạc bất ngờ. Song Ngũ Hoàng đương lệnh, tiền vào tay chớ khoe khoang, xử lý kín đáo là thượng sách.",
        "career": "Nơi công sở quý nhân thấp thoáng, dự án hợp tác tiến triển thuận lợi. Tháng Ngũ Hoàng không nên khai mở sự nghiệp mới, giữ vững thành quả hiện tại sẽ tốt hơn.",
        "love": "Tháng Đào Hoa tình cảm phong phú, người độc thân nhân duyên nơi xa đặc biệt tốt. Người có bạn đời tình cảm thêm mặn nồng, có thể lên kế hoạch du lịch ngắn ngày bồi đắp tình cảm.",
        "health": "Nhất Bạch Tham Lang nhập trung, nhân duyên đào hoa vượng nhưng tâm trạng dễ hưng phấn thái quá, nên giữ sự bình hòa tĩnh tại.",
        "dispute": "Tháng Đào Hoa nhân duyên tuy tốt song giao thiệp với người khác phái cần nắm chắc chừng mực. Bất kể quan hệ trong sáng thế nào cũng tránh chuốc hiểu lầm không đáng có."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Cửu Tử Hữu Bật tinh nhập trung cung lợi cho thiên tài, đầu tư có cơ hội thu hoạch. Song tháng tương xung tiền đến rồi đi, thấy tốt thu tay là hơn, không nên tham luyến.",
        "career": "Chốn công sở biến động khá lớn, có thể có tình huống đột xuất cần ứng đối. Tháng này sự linh hoạt cần đầy đủ, kế hoạch ban đầu sẵn sàng điều chỉnh, không nên cố chấp.",
        "love": "Tháng tương xung tình cảm dao động, với bạn đời dễ có chia cách hoặc cãi cọ. Người độc thân đào hoa tuy có song độ ổn định chưa đủ, chớ vội vàng lún sâu.",
        "health": "Tháng tương xung dễ có xây xát va chạm, hoạt động ngoài trời chú ý an toàn. Tỳ vị dạ dày yếu, ăn uống đúng giờ đủ lượng, chớ ăn uống quá độ.",
        "dispute": "Tháng này biến động nhiều, thị phi theo đó mà nổi lên. Lấy bất biến ứng vạn biến, quyết định trọng đại đợi qua tháng xung hãy bàn."
      },
      {
        "month": "Tháng Bảy (Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Tài vận hồi phục ổn định, thu nhập chính tài như thường lệ. Bát Bạch Tả Phụ tinh nhập trung cung chủ hao tổn, đồ điện tử hoặc xe cộ dễ hỏng hóc, chuẩn bị sẵn chi phí sửa chữa.",
        "career": "Không khí công sở hòa hoãn, những xáo trộn tháng trước dần vào quỹ đạo. Tháng này nên củng cố nhân mạch, trải đường cho nửa cuối năm.",
        "love": "Tình cảm bình ổn, không chìm nổi lớn. Người có bạn đời cuộc sống bình dị là phúc, người độc thân vận xã giao bình thường, cưỡng cầu vô ích.",
        "health": "Sức khỏe tạm ổn, song Kim khí tăng dần, hệ hô hấp yếu ra vào phòng máy lạnh chú ý giữ ấm.",
        "dispute": "Tháng bình ổn thị phi tự nhiên lắng xuống, giữ sự khiêm tốn thì mọi sự êm đềm thanh thản."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Thất Xích Phá Quân tinh nhập trung cung là tháng tài vận tốt nhất trong năm của tuổi Tuất, cả chính tài lẫn thiên tài đều có thu hoạch. Đầu tư có thể tích cực hơn một chút song vẫn phải đặt ngưỡng cắt lỗ, không thể dốc hết vốn vào một canh bạc.",
        "career": "Nơi công sở biểu hiện được ghi nhận, thăng chức hoặc tăng lương đầy hy vọng. Tháng này nên chủ động tranh thủ, cơ hội không tự nhiên rơi xuống.",
        "love": "Tài vận vượng kéo theo tâm trạng vui vẻ, ở bên bạn đời hòa thuận êm ấm. Người độc thân có thể mượn dịp công việc thể hiện thực lực, thu hút người ngưỡng mộ bạn.",
        "health": "Sức khỏe tốt, tinh thần sung mãn. Song tiếp khách khá nhiều, uống rượu nên chừng mực tránh tổn hại gan.",
        "dispute": "Tài vận vượng dễ chuốc người ghen ghét, xử lý kín đáo chuyện thu nhập. Lẳng lặng phát tài thắng hơn bốn phương khoe khoang."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Tài vận trồi sụt, khoản tiền kiếm được tháng trước tháng này có thể phải chi ra. Dự trù ngân sách dự phòng cho tình huống bất ngờ, chớ tiêu hết nhẵn.",
        "career": "Tháng tam hình sóng ngầm công sở tái hiện, với đồng nghiệp dễ sinh ma sát. Xử sự lấy nhu chế cương, đối đầu cứng nhắc chỉ khiến đôi bên cùng tổn thương.",
        "love": "Lục Bạch Vũ Khúc tinh nhập trung, ai có việc hỷ trù bị tháng này sẽ thuận lợi. Người độc thân đào hoa đới hình, người mới quen không nên vội vã tin tưởng.",
        "health": "Tháng hình tâm trạng dao động khá lớn, nên tìm bạn bè tâm sự giải tỏa. Chú ý dị ứng da dẻ, giao mùa cần tăng cường chăm sóc da.",
        "dispute": "Tháng tam hình là đỉnh điểm thị phi thứ hai trong năm, hợp tác với ai phải giấy trắng mực đen. Bất kể thân thiết thế nào, điều khoản rõ ràng sẽ tránh được tranh chấp sau này."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Tháng tam hợp tài vận có quý nhân nâng đỡ, hợp tác cầu tài thắng hơn làm một mình. Tháng này lợi cho việc khai mở nguồn khách hàng mới, nhân mạch chính là tiền tài.",
        "career": "Chốn công sở quý nhân hiển lộ, lúc khó khăn có người đưa tay tương trợ. Nắm bắt cơ hội bày tỏ lòng cảm kích, về sau qua lại càng thêm thắm tình.",
        "love": "Ngũ Hoàng tái lâm, người độc thân duyên phận rất tốt, có thể chủ động xuất kích. Người có bạn đời tình cảm ngọt ngào, thích hợp đính hôn hoặc về chung một nhà.",
        "health": "Sức khỏe tốt, tâm trạng cởi mở vui vẻ. Tháng Hợi Thủy vượng, người Hàn Mệnh chú ý giữ ấm, người Nhiệt Mệnh tinh thần đặc biệt sung mãn.",
        "dispute": "Tháng tam hợp nhân duyên cực tốt, thị phi tự nhiên tránh xa. Kết thiện duyên rộng rãi để tạo bước đệm hoàn hảo cho năm tới."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tài vận hơi yếu, chi tiêu nhiều hơn thu nhập. Tháng tương hại không nên cho vay mượn hay bảo lãnh, tránh bị cuốn vào tranh chấp tài chính. Chính tài tạm ổn, lượng sức mà chi là được.",
        "career": "Chốn công sở có tiểu nhân ngầm hãm hại, giấy tờ hợp đồng phải đối chiếu nhiều lần. Cẩn thận tỉ mỉ bù đắp cho thiếu sót của tháng hại, sơ suất ắt dính bẫy.",
        "love": "Tháng hại tình cảm dễ có hiểu lầm, trao đổi với bạn đời cần kiên nhẫn. Người độc thân đào hoa đới hại, kết bạn trên mạng đặc biệt cần cẩn trọng.",
        "health": "Tứ Lục Văn Khúc tinh trùng lâm, bệnh cũ dễ tái phát. Trời chuyển lạnh, người tim mạch yếu chú ý giữ ấm, trước khi vận động khởi động đầy đủ.",
        "dispute": "Tháng Hại Thái Tuế mũi tên ngầm khó phòng, nói ít làm nhiều là trên hết. Nghe thấy lời phê bình chớ phản ứng tức thì, bình tâm lại rồi hẵng xử lý."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tháng Tuế Phá tài vận chao đảo, chi tiêu cuối năm khá nhiều. Dự trù ngân sách tiêu tết, hoạt động đầu tư tạm dừng là thích hợp.",
        "career": "Biến động công sở tái hiện, có thể có tin tức điều chỉnh vị trí công việc. Giai đoạn cuối năm Hình Thái Tuế, biến động chưa hẳn là việc xấu, thuận thế mà làm là được.",
        "love": "Tháng tương xung tình cảm chịu thử thách, với bạn đời dễ có điềm chia cách. Người độc thân không nên bắt đầu tình cảm mới trong tháng Tuế Phá, đợi sang năm mới sẽ vững vàng hơn.",
        "health": "Tiếp khách cuối năm dày đặc, chú ý cân bằng nghỉ ngơi và ăn uống. Lái xe đi lại hết sức lưu tâm, tháng Tuế Phá dễ có va quẹt nhẹ.",
        "dispute": "Tam Bích thị phi cộng thêm Tuế Phá là tháng thị phi cuối cùng của cả năm. Nhẫn nhịn nhất thời gió yên biển lặng, sang năm sau tiết Lập Xuân khí Hình Thái Tuế tiêu tan, vận trình tự nhiên hồi phục vững vàng."
      }
    ],
    "yearSummary": "Người tuổi Tuất trải qua năm Đinh Mùi Hình Thái Tuế với không ít ma sát thử thách, song nhờ sự che chở của tứ đại cát tinh Thiên Đức, Nguyệt Đức, Phúc Tinh, Bát Tọa mà mọi hiểm nguy đều hóa thành cơ hội rèn giũa bản lĩnh. Bằng sự khiêm nhường, làm việc tuân thủ quy chuẩn và giữ vững đạo nghĩa, bạn sẽ biến năm hình thành một bước đệm vững chắc cho tương lai rạng ngời."
  },
  "Hợi": {
    "name": "Hợi (Heo)",
    "chinese": "豬",
    "english": "Pig",
    "icon": "🐷",
    "relation": "Tam Hợp Quý Nhân",
    "relationBadge": "he",
    "themeYear": "Tam Hợp Cát Tinh • Thuận Thế Tiến Bước",
    "auspiciousStars": [
      "Tam Đài",
      "Thiên Giải",
      "Giải Thần"
    ],
    "inauspiciousStars": [
      "Quan Phù",
      "Ngũ Quỷ",
      "Phi Phù"
    ],
    "overview": "Người tuổi Hợi năm nay được **Tam Hợp trợ lực** (Hợi Mão Mùi tam hợp Mộc cục), nhìn chung vận thế trôi chảy hơn năm Bính Ngọ trước đó. Cung mệnh có bộ ba cát tinh **Tam Đài**, **Thiên Giải**, **Giải Thần** đồng tâm phù trì: Tam Đài chủ nâng đỡ tước vị danh vọng, thi cử thăng chức dễ dàng; Thiên Giải và Giải Thần có uy lực giải trừ hung hiểm phi thường. Tuy nhiên, năm Đinh Mùi Hỏa Thổ khô nóng, bất kể người Hàn, Nhiệt hay Bình mệnh thì quản lý cảm xúc đều là bài học chung. Cát tinh tuy có sức mạnh biến nguy thành an song hung tinh Quan Phù, Ngũ Quỷ, Phi Phù vẫn ngầm chứa sóng gợn, cần giữ vững bổn phận, lượng sức mà chi tiêu thì đến khi Kim Thủy đương lệnh sẽ có cơ hội thăng tiến vượt bậc.",
    "starsAnalysis": "Cát tinh **Tam Đài** giúp vị thế xã hội và uy tín chuyên môn được tôn vinh; **Thiên Giải** và **Giải Thần** hóa giải tai ương ách nạn. Hung tinh có **Quan Phù**, **Ngũ Quỷ**, **Phi Phù**: Quan Phù nhắc nhở cẩn trọng văn bản pháp lý tránh kiện tụng; Ngũ Quỷ cảnh báo tiểu nhân đố kỵ gièm pha sau lưng; Phi Phù dễ gây ra những chuyện rắc rối thị phi bất ngờ từ trên trời rơi xuống. Hãy xử lý giấy tờ minh bạch, không tham gia vào các phi vụ mờ ám thì hung tinh tự động tiêu tan.",
    "hanMenhAdvice": "(sinh từ sau Lập Thu 8/8 đến trước Kinh Trập 6/3 năm sau): Năm Đinh Mùi Hỏa Thổ ấm áp vẫn là dư âm thuận lợi cho Hàn Mệnh, hãy tận dụng thế Tam Hợp để xúc tiến các kế hoạch làm ăn, mở rộng quan hệ đối tác, thu hoạch tài lộc dồi dào.",
    "nhietMenhAdvice": "(sinh từ sau Lập Hạ 6/5 đến trước Lập Thu 8/8): Năm Hỏa Thổ khô nóng không hợp mệnh, cần giữ tâm thái bình thản, dĩ tĩnh chế động, bổ sung yếu tố Thủy (hướng Tây Bắc, màu đen, lam, trắng, xám) để điều hòa cảm xúc, chuẩn bị cho chu kỳ Kim Thủy từ năm 2028.",
    "binhMenhAdvice": "(sinh từ sau Kinh Trập 6/3 đến trước Lập Hạ 6/5): Vận thế trung quy trung củ, làm việc chắc chắn, tích lũy tài nguyên và hoàn thiện kỹ năng chuyên môn.",
    "birthYears": [
      {
        "year": 2019,
        "canChi": "Kỷ Hợi",
        "age": "9 tuổi âm",
        "reading": "Bé chăm ngoan thông minh, được gia đình chăm sóc chu đáo, chú ý ăn uống thanh đạm và giữ gìn hệ tiêu hóa khỏe mạnh."
      },
      {
        "year": 2007,
        "canChi": "Đinh Hợi",
        "age": "21 tuổi âm",
        "reading": "Đang độ học tập thi cử, có Tam Đài trợ lực, trí tuệ sáng dạ tiếp thu nhanh, cần chuyên tâm ôn luyện để đạt thành tích rực rỡ."
      },
      {
        "year": 1995,
        "canChi": "Ất Hợi",
        "age": "33 tuổi âm",
        "reading": "Giai đoạn then chốt của sự nghiệp, năm Tam Hợp quý nhân mở ra nhiều cơ hội hợp tác làm ăn, hãy tự tin nắm bắt cơ hội để khẳng định mình."
      },
      {
        "year": 1983,
        "canChi": "Quý Hợi",
        "age": "45 tuổi âm",
        "reading": "Sự nghiệp thăng hoa chín muồi, tài lộc dồi dào, cần phân bổ tài chính thông minh, tránh cho vay mượn liều lĩnh do ảnh hưởng của Ngũ Quỷ."
      },
      {
        "year": 1971,
        "canChi": "Tân Hợi",
        "age": "57 tuổi âm",
        "reading": "Vị thế công danh vững chắc, gia đạo êm ấm thuận hòa, chuẩn bị chu đáo phương án chuyển giao thế hệ kế cận."
      },
      {
        "year": 1959,
        "canChi": "Kỷ Hợi",
        "age": "69 tuổi âm",
        "reading": "Tuổi hoa giáp an nhàn, con cháu thành đạt hiếu thảo, chú ý kiểm tra định kỳ sức khỏe tim mạch và duy trì nếp sinh hoạt điều độ."
      },
      {
        "year": 1947,
        "canChi": "Đinh Hợi",
        "age": "81 tuổi âm",
        "reading": "Đại thọ diên niên, gia đình sum vầy ấm cúng, tinh thần an nhiên tự tại trường thọ."
      }
    ],
    "monthlyFortunes": [
      {
        "month": "Tháng Giêng (Nhâm Dần)",
        "theme": "Tháng tư tưởng học tập đầu tư",
        "finance": "Chính tài bình ổn, thiên tài chưa thấy. Người có kế hoạch đầu tư tháng này chỉ nên quan sát, hành động thực tế để dành sau mùa xuân. Chi tiêu hơi tăng, phần lớn do học tập bồi dưỡng hoặc tiếp khách.",
        "career": "Kế hoạch mới đang giai đoạn thai nghén, cấp trên hoặc khách hàng khá hứng thú với ý tưởng của bạn song cần thời gian thực hiện. Ngũ Hoàng Liêm Trinh tinh nhập trung cung, mầm tai bệnh tiềm ẩn kỵ động thổ mạo hiểm.",
        "love": "Người độc thân qua bạn bè giới thiệu có cơ hội quen biết đối tượng, song tháng tư tưởng tình cảm tiến triển chậm rãi. Người có bạn đời nên chia sẻ về định hướng tương lai, tránh vì bận rộn mà sinh xa cách.",
        "health": "Đầu xuân hàn lạnh chưa dứt, đường hô hấp khá yếu, ra vào nơi máy lạnh nên mang áo khoác. Tháng tư tưởng dễ mất ngủ, ban đêm giảm thời gian nhìn màn hình điện thoại là tốt nhất.",
        "dispute": "Nhân duyên tuy tốt song nói nhiều tất hớ, nơi tụ họp không nên bình luận chuyện đời tư người khác. Ngũ Hoàng nhập trung cũng chủ về tửu sắc, tiệc tùng nên có chừng mực."
      },
      {
        "month": "Tháng Hai (Quý Mão)",
        "theme": "Tháng Dịch Mã",
        "finance": "Tượng động trung cầu tài, ra ngoài công tác hoặc khách hàng phương xa mang lại thu nhập thêm. Tứ Lục Văn Khúc tinh nhập trung cung, lợi cho học tập văn thư thi cử.",
        "career": "Tháng Dịch Mã chủ biến động, cơ hội điều chuyển vị trí, đào tạo biệt phái hoặc dự án ngắn hạn nổi lên. Chủ động tranh thủ thì có, ngồi yên một chỗ thì bỏ lỡ, tùy thuộc vào ý chí bản thân.",
        "love": "Người độc thân duyên nơi xa khá tốt, du lịch hay quen qua mạng đều có thể. Người có bạn đời tụ ít xa nhiều, lòng tin là chìa khóa duy trì, không cần lo nghĩ quá nhiều.",
        "health": "Tứ Lục Văn Khúc tinh đương lệnh, tỳ vị tiêu hóa yếu hơn, ăn uống bên ngoài nên thanh đạm. Tháng Dịch Mã lái xe cần tập trung tinh thần, đường dài tránh lái xe khi mệt mỏi.",
        "dispute": "Ra ngoài bớt lo chuyện bao đồng là hơn. Sự khác biệt văn hóa nơi xa dễ sinh hiểu lầm, bao dung thì không có trở ngại."
      },
      {
        "month": "Tháng Ba (Giáp Thìn)",
        "theme": "Tháng Thái Tuế tam hình",
        "finance": "Tiền đến rồi đi, chính tài tạm vững, thiên tài tuyệt đối không chạm vào. Chi tiêu tháng này có thể có khoản phát sinh đột xuất, dự trù sẵn vốn lưu động phòng khi cấp bách.",
        "career": "Tam Bích thị phi nhập trung cung, sóng ngầm công sở khá nhiều, giấy tờ qua lại kiểm tra xác nhận nhiều lần tránh bị liên lụy. Thái Tuế tam hình, cư xử với cấp trên nên khiêm tốn nhã nhặn, không tranh hơn thua nhất thời.",
        "love": "Người độc thân đào hoa đới hình, lai lịch người mới quen nên tìm hiểu nhiều hơn. Người có bạn đời dễ vì chuyện vặt vãnh gia đình mà tranh cãi, lùi một bước biển rộng trời cao.",
        "health": "Can khí thiên vượng, cảm xúc dễ dao động, ngủ sớm dậy sớm là phương pháp điều dưỡng tốt nhất. Bệnh cũ nếu có dấu hiệu tái phát cần sớm xử lý dứt điểm.",
        "dispute": "Tháng tam hình thị phi khó tránh, bất kể thân sơ đều giảm bớt chuyện cho vay mượn bảo lãnh. Phát ngôn trên mạng xã hội cũng cần thận trọng, chụp ảnh màn hình lưu chứng cứ để tự bảo vệ mình."
      },
      {
        "month": "Tháng Tư (Ất Tỵ)",
        "theme": "Tháng tương hại",
        "finance": "Tài vận bình lặng, không có nguồn thu lớn. Dự án hợp tác dễ có hao tổn ngầm, đối chiếu sổ sách phải tự tay làm, phó thác cho người khác ắt có lỗ hổng.",
        "career": "Nhị Hắc Cự Môn tinh nhập trung cung, Bệnh Phù đương lệnh cần lưu ý sức khỏe. Văn Xương tinh chiếu có lợi cho thi cử lấy chứng chỉ. Tháng tương hại nhân sự ngầm tổn hại, đồng nghiệp bề ngoài hòa thuận thực chất mỗi người một toan tính, việc quan trọng xử lý kín đáo.",
        "love": "Người độc thân Văn Xương chủ về tài hoa, thể hiện tài năng giúp thu hút ánh nhìn, song tháng tương hại người gặp chưa hẳn đã thật lòng. Người có bạn đời dễ vì ý kiến hai bên gia đình mà sinh áp lực, điều phối là hơn.",
        "health": "Tứ Lục thuộc Mộc, hệ thống gan mật nên chú ý nhiều hơn, bớt uống rượu, ăn nhiều rau xanh. Tháng tương hại tâm trạng dễ u uất, đi dạo công viên giúp giải tỏa căng thẳng.",
        "dispute": "Tương hại chủ tiểu nhân ngấm ngầm, tháng này không nên chuyển việc hay quyết định biến động lớn. Lời ong tiếng ve nghe rồi bỏ qua, không cần truy cứu sâu."
      },
      {
        "month": "Tháng Năm (丙午 - Bính Ngọ)",
        "theme": "Tháng Lục Hợp / Đào Hoa",
        "finance": "Chính tài có bước tiến, tiền thưởng dự án hoặc thù lao ngoài giờ kỳ vọng có được. Nhất Bạch Tham Lang tinh nhập trung cung, nhân duyên đào hoa hanh thông.",
        "career": "Tháng Lục Hợp quý nhân âm thầm giúp đỡ, nan đề phần lớn đều được giải quyết êm thấm. Tháng Đào Hoa cũng chủ về nhân duyên, quan hệ khách hàng duy trì tốt thì hợp tác sau này trôi chảy.",
        "love": "Người độc thân đào hoa vượng nhất, nơi xã giao chủ động xuất kích cơ hội thành công khá cao. Người có bạn đời tình cảm thăng hoa, thích hợp đính hôn, ra mắt hai bên gia đình, song Ngũ Hoàng đương lệnh đại sự nên chọn ngày lành.",
        "health": "Ngũ Hoàng chủ tai bệnh, tháng này không nên thăm bệnh viếng tang tránh nhiễm khí xấu. Hỏa viêm Thổ táo, uống nhiều nước phòng say nắng, hoạt động ngoài trời tránh giờ chính ngọ.",
        "dispute": "Đào hoa quá vượng ngược lại biến thành kiếp nạn, giao thiệp với người khác giới giữ chừng mực tránh rước họa tình ái. Tháng Lục Hợp tuy được người giúp song cũng phải biết đền đáp, chớ xem là điều đương nhiên."
      },
      {
        "month": "Tháng Sáu (丁未 - Đinh Mùi)",
        "theme": "Tháng tương xung",
        "finance": "Tài vận trồi sụt, chính tài tạm tính là ổn định, song chi tiêu đột xuất dễ xuất hiện, bảo dưỡng xe cộ hay sửa sang nhà cửa nên kiểm tra sớm. Cửu Tử Hữu Bật tinh nhập trung cung, hỷ khánh đào hoa lâm môn.",
        "career": "Tháng tương xung mang tượng biến động, tin tức tái cơ cấu công ty hay luân chuyển vị trí có thể truyền ra. Chủ động cầu biến thì có cơ hội, bị động chờ đợi dễ rơi vào khốn cảnh, tùy hoàn cảnh mà định đoạt.",
        "love": "Người độc thân tình cảm đến nhanh đi vội, không nên vội vã lún sâu. Người có bạn đời dễ vì nhịp sống khác biệt mà sinh ma sát, nhường nhịn nhau thì không có gì trở ngại.",
        "health": "Tháng tương xung dễ va chạm tổn thương, lái xe đi xe đặc biệt lưu tâm. Phổi và hệ hô hấp yếu, nơi không khí ngột ngạt bụi bặm bớt nán lại.",
        "dispute": "Tháng xung cảm xúc dao động khá lớn, tranh cãi với người khác dễ lỡ lời nói nặng. Hối hận về sau chi bằng nhẫn nhịn ngay lúc đó, tháng này lấy hòa làm quý."
      },
      {
        "month": "Tháng Bảy (戊申 - Mậu Thân)",
        "theme": "Tháng bình ổn",
        "finance": "Tài vận hồi phục ổn định, sóng gió tháng trước dần lắng dịu. Bát Bạch Tả Phụ tinh nhập trung cung đại lợi tài vận.",
        "career": "Tháng bình ổn không có đột phá lớn, cứ từng bước theo kế hoạch mà làm. Thất Xích chủ hao tổn, dự án cũ có thể cần thêm tài nguyên, dự toán cần chừa khoảng co giãn.",
        "love": "Người độc thân đào hoa bình lặng, chuyên tâm nâng cấp bản thân là hơn. Người có bạn đời quan hệ vững vàng, chuyện vụn vặt thường ngày tuy bình dị nhưng tình cảm bền lâu cũng là phúc.",
        "health": "Tiết tháng Bảy âm lịch, đêm về nên về sớm, người tinh thần yếu bớt đến nơi tối tăm u ám. Tháng bình ổn thích hợp tạo lập thói quen tập thể thao kiên trì.",
        "dispute": "Bát Bạch Tả Phụ tinh nhập trung cung chủ về khẩu thiệt quan phi, gia hạn ký kết hợp đồng xem kỹ điều khoản, lời hứa miệng không đủ làm căn cứ. Tháng này lấy tĩnh chế động, bớt lo chuyện bao đồng."
      },
      {
        "month": "Tháng Tám (Kỷ Dậu)",
        "theme": "Tháng bình ổn",
        "finance": "Thất Xích Phá Quân tinh nhập trung cung, là một trong những tháng tài vận tốt nhất trong năm. Cả chính tài lẫn thiên tài đều có thu hoạch, kế hoạch tích lũy bấy lâu có thể thúc đẩy trong tháng này, song phòng phá tài tổn thất, thấy tốt thu tay.",
        "career": "Trong bình ổn thấy sự tiến bộ, nỗ lực trải đường trước đó dần đến ngày đền đáp. Thổ khí dày dặn, sự vụ liên quan bất động sản tương đối thuận lợi, ai có nhu cầu có thể nắm bắt.",
        "love": "Tình cảm êm ả thuận hòa, đôi lứa cùng chia sẻ những mục tiêu chung. Người độc thân có duyên gặp gỡ qua công việc hoặc bạn bè thân hữu.",
        "health": "Khí thu hanh táo, chú ý da dẻ khô ráp và cổ họng rát, uống nhiều nước ấm và các món canh dưỡng âm.",
        "dispute": "Vận may đang lên cần giữ tác phong kín kẽ, thành công không khoe khoang để tránh chuốc lấy ghen tị đố kỵ."
      },
      {
        "month": "Tháng Chín (Canh Tuất)",
        "theme": "Tháng tam hình / Đề phòng thị phi",
        "finance": "Tài vận hồi lạc, chính tài tạm ổn, đầu tư thì thấy tốt thu tay. Lục Bạch Vũ Khúc tinh nhập trung cung, vị thế thiên tài có lợi.",
        "career": "Tháng tam hình áp lực công sở khá lớn, hợp tác đội ngũ dễ bất đồng ý kiến. Hỏa khí trợ trưởng tính khí nóng nảy, trong hội nghị cần kiềm chế cảm xúc, chỉ bàn việc không công kích cá nhân.",
        "love": "Người độc thân tháng hỷ sự nhân duyên không tệ, song tam hình chủ trắc trở, tiến triển chưa hẳn đã thuận buồm xuôi gió. Người có bạn đời dễ vì quan niệm tiền bạc mà tranh cãi, cởi mở bàn bạc là hơn.",
        "health": "Hỏa Thổ khô nóng tái xuất hiện, dị ứng da hoặc đường ruột khó chịu dễ phát sinh, ăn uống thanh đạm là cốt lõi. Tháng tam hình cảm xúc dễ bực bội, ngồi thiền tịnh tâm giúp bình hòa.",
        "dispute": "Tam hình cộng hưởng Cửu Tử, khẩu thiệt thị phi đặc biệt nhiều. Tháng này không nên làm người trung gian đứng giữa kẻo hai đầu chịu oán. Phát ngôn trên mạng xã hội suy nghĩ kỹ."
      },
      {
        "month": "Tháng Mười (Tân Hợi)",
        "theme": "Tháng tam hợp",
        "finance": "Tháng tam hợp nhân duyên mang lại tài lộc, khách hàng cũ quay lại hoặc giới thiệu thêm cơ hội làm ăn. Ngũ Hoàng Liêm Trinh tinh nhập trung cung, mầm tai bệnh tiềm ẩn, đầu tư mạo hiểm nên kiêng kỵ, chi tiêu tiếp khách kiểm soát vừa độ.",
        "career": "Lực tam hợp mạnh mẽ, dự án trọng đại nên thúc đẩy trong tháng này. Hợp tác cùng người tuổi Mão, tuổi Mùi đặc biệt trôi chảy, đối tác mới nên ưu tiên cân nhắc.",
        "love": "Người độc thân đào hoa tái hiện, chất lượng vững vàng hơn tháng Năm, triển vọng phát triển nghiêm túc rất sáng. Người có bạn đời hòa thuận êm ấm, chung sở thích tăng thêm thấu hiểu.",
        "health": "Thủy khí tăng vượng, người Hàn Mệnh cảm thấy vô cùng sảng khoái, người Nhiệt Mệnh phòng hao tổn thận thủy. Giữ ấm và sinh hoạt có tiết chế là bài học chung cho cả hai.",
        "dispute": "Tháng tam hợp quý nhân nhiều, thị phi tương đối giảm bớt. Song nơi tiệc tùng rượu vào lời ra dễ lỡ lời, uống có chừng mực, giữ vững sự tỉnh táo."
      },
      {
        "month": "Tháng Mười Một (壬子 - Nhâm Tý)",
        "theme": "Tháng Hại Thái Tuế",
        "finance": "Tài vận bình lặng, không có khởi sắc lớn. Tháng Hại Thái Tuế dễ có tổn thất ngấm ngầm, hóa đơn nộp phí đối chiếu rõ ràng, chuyển khoản tự động cũng phải rà soát lại.",
        "career": "Tứ Lục Văn Khúc tinh nhập trung cung, lợi cho học tập văn thư thi cử. Tháng Hại Thái Tuế nhân tế ngầm tổn hại, giữa đồng nghiệp giữ khoảng cách lịch thiệp, không vội vàng dốc hết ruột gan.",
        "love": "Người độc thân đào hoa đới hại, đối tượng mới quen có thể giấu giếm điều gì đó, không nên tin tưởng quá sớm. Người có bạn đời dễ vì hiểu lầm mà sinh hiềm khích, kịp thời làm rõ tránh tích tụ.",
        "health": "Nhị Hắc đương lệnh, đường ruột dạ dày và da dẻ là vùng trọng điểm, vệ sinh ăn uống đặc biệt lưu tâm. Tháng Hại Thái Tuế tinh thần dễ mệt mỏi, ngủ đủ giấc là ưu tiên hàng đầu.",
        "dispute": "Hại Thái Tuế chủ thị phi ngấm ngầm sau lưng, tháng này không nên cho vay mượn bảo lãnh, cũng không bảo lãnh cho ai. Ký kết giấy tờ đọc từng điều khoản tránh tranh chấp sau này."
      },
      {
        "month": "Tháng Chạp (癸丑 - Quý Sửu)",
        "theme": "Tháng tương xung (Tháng Tuế Phá)",
        "finance": "Tháng tương xung cuối cùng của năm, tài vận trồi sụt thất thường. Chi tiêu cuối năm tập trung dồn dập, tiền thưởng bao lì xì có thể có sự chậm trễ, dòng tiền cần dự trù sắp xếp sớm.",
        "career": "Tháng Tuế Phá mang tượng biến động, kế hoạch năm tới có thể có tin tức truyền ra. Tam Bích thị phi tinh nhập trung cung, tin đồn chưa được kiểm chứng không cần để bụng, tĩnh đợi thông báo chính thức.",
        "love": "Người độc thân dịp cuối năm áp lực khá lớn, người thân quan tâm có thể trở thành gánh nặng, bình thản ứng đối là được. Người có bạn đời chuẩn bị đón tết, phân công hợp tác tránh sinh oán thán.",
        "health": "Tháng xung dễ có tai nạn va chạm bất ngờ, cuối năm tiếp khách nhiều, uống rượu chừng mực, thuê người lái xe hoặc phương tiện công cộng là thượng sách. Tam Bích chủ can khí uất kết, quản lý cảm xúc không thể xem nhẹ.",
        "dispute": "Tháng Tuế Phá thị phi khó tránh, Tam Bích làm gia tăng khẩu thiệt. Bất luận ở công sở hay gia đình, dĩ hòa vi quý, khơi lại chuyện cũ chỉ làm tổn thương tình cảm. Năm mới sắp tới, buông bỏ gánh nặng, xuất phát lại từ đầu."
      }
    ],
    "yearSummary": "Người tuổi Hợi năm Đinh Mùi được thế Tam Hợp Mộc cục tương trợ, nhìn chung vận thế trôi chảy hanh thông hơn năm Bính Ngọ trước đó. Dù năm Hỏa Thổ khô nóng đòi hỏi sự kiềm chế cảm xúc, song có các cát tinh lớn Tam Đài, Thiên Giải, Giải Thần đồng hành hóa hiểm thành an. Giữ vững bổn phận, lượng sức mà chi tiêu, khiêm nhường đối nhân xử thế thì sự nghiệp và tài lộc sẽ từng bước thăng hoa vững vàng."
  }
};
