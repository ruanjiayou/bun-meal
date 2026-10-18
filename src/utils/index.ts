import type { IRecord } from "@/global";
import { addDays, formatDate } from "date-fns";

export function getDateRepeatedList(date: string, map: any) {
  const dish_ids = new Set();
  const repeats = new Set();
  const todayDate = new Date(date);
  for (let i = -7; i <= 7; i++) {
    const currDate = formatDate(addDays(todayDate, i), 'yyyy-MM-dd')
    const ids = (map.get(currDate) || []).map((v: IRecord) => v.dish_id);
    ids.map((id: string) => {
      if (dish_ids.has(id)) {
        repeats.add(id);
      } else {
        dish_ids.add(id)
      }
    })
  }
  return Array.from(repeats);
}

export function groupBy<T extends object>(list: T[], field: keyof T) {
  const map: Record<string | number, T[]> = {};
  list.forEach(v => {
    const key = String(v[field]);

    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(v);
  });

  return map;
}

export function keyBy<T extends object>(list: T[], field: keyof T) {
  const map: { [key: string]: T } = {};
  list.forEach(v => {
    const key = String(v[field]);
    map[key] = v;
  })
  return map;
}

/** 富文本 HTML 转纯文本预览 */
export function htmlToText(html?: string) {
  if (!html) return '';
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, '');
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  return (div.textContent || '').replace(/\s+\n/g, '\n').trim();
}