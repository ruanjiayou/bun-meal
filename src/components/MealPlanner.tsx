import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { format, subDays, addDays, isSameMonth, formatDate, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, } from 'date-fns'
import { getRecordsByDate, } from '../apis'
import DayMealSelector from './DayMealSelector'

import { getDateRepeatedList } from '../utils'
import { useSnapshot } from 'valtio'
import { Swiper, SwiperSlide } from 'swiper/react';
import global, { useLocalProxy, type IRecord } from '../global'
import { User } from 'user-info'

import {
  Main,
  CalendarDays,
  CalendarDay,
  CalendarGrid,
  Weekdays,
  Weekday,
  outside,
  DayNumber,
  MealBlock,
  MealLabel,
  MealDishes,
  DishTag,
  CompactMeals,
  DayPanel,
  DayPanelHeader,
  DayPanelTitle,
  DayPanelEdit,
  DayPanelBody,
  DayRow,
  DayRowLabel,
  DayDishList,
  DayDishItem,
  DayPanelEmpty,
} from '../styles/MealPlanner'

/** 早 / 中 / 晚 三餐 */
const MEALS = [
  { type: 'breakfast', label: '早' },
  { type: 'lunch', label: '午' },
  { type: 'dinner', label: '晚' },
]

const OneDish = ({ item }: { item: IRecord }) => {
  return (
    <DishTag
      className={`dish-tag ${item.repeated ? 'repreated' : ''}`}
    >
      {item.dish?.title}
    </DishTag>
  )
}

const Grids42 = ({ month, today, compact, onSelect, onLongPress }: any) => {
  const globalState = useSnapshot(global)
  const date = new Date(month);
  const monthStart = startOfMonth(date);
  const start_of42 = subDays(monthStart, (monthStart.getDay() === 0 ? 7 : monthStart.getDay()) - 1);
  const end_of42 = addDays(start_of42, 41);
  const days = eachDayOfInterval({ start: start_of42, end: end_of42 })

  // 长按计时：移动超过 10px（滑动翻月）即取消
  const pressRef = useRef<{ timer: any; x: number; y: number; fired: boolean } | null>(null)
  const clearPress = () => {
    if (pressRef.current?.timer) clearTimeout(pressRef.current.timer)
    pressRef.current = null
  }
  const startPress = (dateStr: string, e: React.PointerEvent) => {
    // 只响应鼠标左键，右键/中键不参与长按与选中
    if (e.pointerType === 'mouse' && e.button !== 0) {
      clearPress()
      return
    }
    clearPress()
    const timer = setTimeout(() => {
      if (!pressRef.current) return
      pressRef.current.fired = true
      onLongPress(dateStr)
    }, 480)
    pressRef.current = { timer, x: e.clientX, y: e.clientY, fired: false }
  }
  const movePress = (e: React.PointerEvent) => {
    const p = pressRef.current
    if (!p) return
    if (Math.abs(e.clientX - p.x) > 10 || Math.abs(e.clientY - p.y) > 10) clearPress()
  }
  const endPress = (dateStr: string) => {
    const p = pressRef.current
    clearPress()
    // 长按已打开弹框，短按只选中日期
    if (!p || p.fired) return
    onSelect(dateStr)
  }

  return <CalendarDays>
    {days.map(day => {
      const date = format(day, 'yyyy-MM-dd')
      const dayMeals = globalState.dateRecordsMap.get(date) || [];
      const sameMonth = isSameMonth(day, month)

      return (
        <CalendarDay
          key={date}
          className={`${!sameMonth ? outside : ''} ${date === today ? 'today' : ''} ${date === globalState.selectedDate ? 'selected' : ''}`}
          onPointerDown={(e) => { if (sameMonth) startPress(date, e) }}
          onPointerMove={movePress}
          onPointerUp={() => { if (sameMonth) endPress(date) }}
          onPointerCancel={clearPress}
          onPointerLeave={clearPress}
        >
          <DayNumber>{format(day, 'd')}</DayNumber>
          {compact ? (
            // 精简模式：只显示有记录的餐次（早/午/晚）
            <CompactMeals>
              {MEALS.map(meal => {
                const has = dayMeals.some(v => v.type === meal.type)
                return has ? (
                  <MealLabel key={meal.type} className={meal.type}>{meal.label}</MealLabel>
                ) : null
              })}
            </CompactMeals>
          ) : (
            MEALS.map(meal => {
              const dishes = dayMeals.filter(v => v.type === meal.type)
              if (dishes.length === 0) return null
              return (
                <MealBlock key={meal.type} className={`${meal.type}-block`}>
                  <MealLabel className={meal.type}>{meal.label}</MealLabel>
                  <MealDishes>
                    {dishes.map(v => (
                      <OneDish item={v} key={v.id} />
                    ))}
                  </MealDishes>
                </MealBlock>
              )
            })
          )}
        </CalendarDay>
      )
    })}
  </CalendarDays>
}

const CacheGrid = memo(({ month, today, compact, onSelect, onLongPress }: any) => {
  return <Grids42 month={month} today={today} compact={compact} onSelect={onSelect} onLongPress={onLongPress} />
}, (prev, next) => {
  return prev.month === next.month && prev.compact === next.compact && prev.today === next.today
})

const MealPlanner = () => {
  const globalState = useSnapshot(global)
  const swiperRef = useRef(null);
  const user = useSnapshot(User)
  const compact = globalState.compactMode
  const [localState, localProxy] = useLocalProxy({
    // 精简模式下，选中日期只显示下方列表，点「编辑」才打开弹窗
    editorOpen: false,
  })

  useEffect(() => {
    if (user.isLogin) {
      loadDateRecords()
      // 获取本月所需数据(本月+前后7天)
      getRecordsByDate(formatDate(globalState.currentDateTime, 'yyyy-MM')).then(list => {
        global.setRecordsMap(list)
      })
    } else {
      global.dateRecordsMap.clear()
    }
  }, [globalState.currentDateTime, user.isLogin])

  // 切换视图模式时收起编辑弹窗
  useEffect(() => {
    if (compact) {
      localProxy.editorOpen = false
    }
  }, [compact])

  const loadDateRecords = async () => {
    global.loadLocalRecords(globalState.currentDateTime)
    // 计算本月部分数据的重复菜品
    // globalState.calc_repeat(globalState.currentDateTime)
  }

  const onChange = () => {
    // @ts-ignore
    global.setRecordsMap(globalState.dateRecordsMap)
  }

  // 短按日期：只选中（精简模式显示下方列表）
  const onSelect = useCallback((dateStr: string) => {
    if (!global.dateRecordsMap.get(dateStr)) {
      global.setDateRecords(dateStr, [])
    }
    global.setSelectedDate(dateStr)
    localProxy.editorOpen = false
  }, [])

  // 长按日期：选中并打开编辑弹框
  const onLongPress = useCallback((dateStr: string) => {
    if (!global.dateRecordsMap.get(dateStr)) {
      global.setDateRecords(dateStr, [])
    }
    global.setSelectedDate(dateStr)
    localProxy.editorOpen = true
  }, [])

  const selectedDate = globalState.selectedDate
  const selectedRecords = selectedDate ? (globalState.getDateRecords(selectedDate) || []) : []
  const showEditor = !!selectedDate && localState.editorOpen
  // 精简模式下选中日期后显示下方面板：此时日历区收缩到 70%，列表占剩余高度
  const mainClassName = [compact ? 'compact' : '', compact && selectedDate ? 'has-panel' : ''].filter(Boolean).join(' ')

  return (
    <Main className={mainClassName}>
      <CalendarGrid>
        <Weekdays>
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
            <Weekday key={day}>{day}</Weekday>
          ))}
        </Weekdays>
        <Swiper
          // 阻止 Swiper 触发浏览器的默认滚动/手势行为
          touchMoveStopPropagation={true}
          // 阻止冒泡，防止嵌套 Swiper 时触发父级滑动
          nested={true}
          // 模拟手势时的边缘行为（类似于 CSS 的 overscroll-behavior）
          // 防止滑动到最后一张时带动页面弹性滚动
          edgeSwipeDetection={true}
          edgeSwipeThreshold={20}
          // 重要的触摸保护
          touchStartPreventDefault={false} // 允许某些点击行为，但滑动仍由 Swiper 接管

          initialSlide={1} // 默认显示第二个
          modules={[]}
          ref={swiperRef}
          style={{ width: '100%', height: '100%' }}
          spaceBetween={50}
          slidesPerView={1}
          onTransitionEnd={(evt) => {
            if (evt.activeIndex === 1) {
              return;
            }
            if (evt.swipeDirection === 'prev') {
              global.subMonth()
            } else {
              global.addMonth()
            }
            evt.slideTo(1, 0);
          }}
        >
          {globalState.months.map(month => (
            <SwiperSlide key={month} id={month}>
              <CacheGrid
                month={month}
                today={globalState.today}
                compact={compact}
                onSelect={onSelect}
                onLongPress={onLongPress}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </CalendarGrid>

      {/* 精简模式：选中日期后，在日历下方显示当天记录 */}
      {compact && selectedDate && (
        <DayPanel>
          <DayPanelHeader>
            <DayPanelTitle>{selectedDate} 记录</DayPanelTitle>
            <DayPanelEdit onClick={() => { localProxy.editorOpen = true }}>
              编辑
            </DayPanelEdit>
          </DayPanelHeader>
          <DayPanelBody>
            {selectedRecords.length === 0 ? (
              <DayPanelEmpty>当天还没有记录</DayPanelEmpty>
            ) : (
              MEALS.map(meal => {
                const dishes = selectedRecords.filter(v => v.type === meal.type)
                if (dishes.length === 0) return null
                return (
                  <DayRow key={meal.type}>
                    <DayRowLabel className={meal.type}>{meal.label}</DayRowLabel>
                    {/* 按菜品逐条显示 */}
                    <DayDishList>
                      {dishes.map(v => (
                        <DayDishItem key={v.id}>{v.dish?.title}</DayDishItem>
                      ))}
                    </DayDishList>
                  </DayRow>
                )
              })
            )}
          </DayPanelBody>
        </DayPanel>
      )}

      {showEditor && (
        <DayMealSelector
          date={selectedDate}
          onChange={onChange}
          onClose={() => {
            // 关闭弹框后保留选中日期（精简模式下下方列表继续显示）
            localProxy.editorOpen = false
          }}
        />
      )}
    </Main>
  )
}
export default MealPlanner
