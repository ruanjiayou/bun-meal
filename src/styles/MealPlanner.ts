import { styled } from '@linaria/react';
import { css } from '@linaria/core';

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 0;
  overflow: hidden;
  position: relative;
`

export const CalendarGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;

  /* 精简模式 + 已选日期：日历区随内容自适应，最高 70%，其余高度留给下方记录列表 */
  .compact.has-panel & {
    flex: 0 1 auto;
    height: auto;
    max-height: 70%;
    min-height: 0;
  }

  .swiper,
  .swiper-wrapper {
    height: 100%;
  }
  .swiper-slide {
    height: 100%;
    overflow: hidden auto;
  }
`
export const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  line-height: 18px;
  padding-bottom: 10px;
  flex-shrink: 0;

  .compact & {
    line-height: 14px;
    padding-bottom: 4px;
  }
`
export const Weekday = styled.div`
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 8px;
  font-size: 16px;

  .compact & {
    padding: 2px 0;
    font-size: 12px;
  }
`
export const CalendarDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  flex: 1;
  min-height: 0;
  // height: 100%;
  // overflow-y: auto;
  // overflow-x: hidden;
  /* 行高不设上限，最小 50px；行按内容自然撑开，整块区域纵向滚动 */
  grid-auto-rows: minmax(50px, auto);
  align-content: start;
  /* 整个日期区域内部滚动 */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  padding-right: 2px;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    gap: 2px;
  }

  .compact & {
    padding-bottom: 2px;

    @media (max-width: 768px) {
      gap: 3px;
    }
  }
`
export const CalendarDay = styled.div`
  /* aspect-ratio: 1; */
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  /* 长按不触发选中文字 / 系统菜单 */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;

  @media (max-width: 768px) {
    gap: 2px;
    padding: 6px;
  }

  &::-webkit-scrollbar {
    display: none;
  }
  &:hover {
    border-color: #667eea;
    background-color: #f8f9ff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
  &.today {
    background-color: lightgoldenrodyellow;
  }
  &.selected {
    border-color: #667eea;
    background-color: #f2f4ff;
    box-shadow: inset 0 0 0 1px #667eea;
  }
  &.other-month {
    opacity: 0.4;
    cursor: default;
  }
  &.other-month:hover {
    border-color: #e0e0e0;
    background-color: white;
    box-shadow: none;
  }
`
export const outside = css`
  opacity: 0.5;
`
export const DayNumber = styled.div`
  font-weight: 600;
  /* color: #333; */
  font-size: 16px;
  padding: 0 4px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`
export const MealBlock = styled.div`
  display: flex;
  gap: 4px;
  align-items: flex-start;
  flex-wrap: wrap;
  align-content: flex-start;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
    gap: 2px;
  }
`
export const MealLabel = styled.div`
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;

  &.breakfast {
    background-color: #2196f3b0;
  }
  &.lunch {
    background-color: #ff9800b0;
  }
  &.dinner {
    background-color: #333333b0;
  }
`
/* 精简模式：日历格子里只显示有记录的餐次 */
export const CompactMeals = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-content: flex-start;
  font-size: 12px;

  @media (max-width: 768px) {
    gap: 2px;
    font-size: 10px;
  }
`
/* 精简模式：日历下方的当天记录列表 */
export const DayPanel = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`
export const DayPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f5;
  flex-shrink: 0;
`
export const DayPanelTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
`
export const DayPanelEdit = styled.button`
  border: 1px solid #667eea;
  background: #f2f4ff;
  color: #667eea;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 14px;
  cursor: pointer;
  flex-shrink: 0;

  &:active {
    background: #e6e9ff;
  }
`
export const DayPanelBody = styled.div`
  flex: 1;
  min-height: 0;
  /* 下方列表内部可滚动 */
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
`
export const DayRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
`
export const DayRowLabel = styled.span`
  flex-shrink: 0;
  color: #fff;
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 12px;

  &.breakfast {
    background: #2196f3b0;
  }
  &.lunch {
    background: #ff9800b0;
  }
  &.dinner {
    background: #333333;
  }
`
export const DayRowDishes = styled.div`
  color: #444;
  word-break: break-word;
`
/* 下方列表：按菜品逐条展示 */
export const DayDishList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`
export const DayDishItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #444;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;

  &::before {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #c2c8d6;
    flex-shrink: 0;
    transform: translateY(-2px);
  }
`
export const DayPanelEmpty = styled.div`
  color: #999;
  font-size: 12px;
  padding: 10px 0;
  text-align: center;
`
export const MealDishes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  flex: 1;
`
export const DishTag = styled.span`
  background-color: #ccc;
  color: #333;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  &.repreated {
    background-color: #ffc107;
    color: white;
    font-weight: 600;
  }
`
