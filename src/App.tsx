import React, { useState, useEffect, useCallback } from 'react'
import MealPlanner from './components/MealPlanner'
import DishManager from './components/DishManager'
import { CalendarDays, ChefHat } from 'lucide-react'
import { getDishes, getKinds, } from './apis'
import { formatDate } from 'date-fns'
import { useSnapshot } from 'valtio'
import global, { useLocalProxy } from './global'
import { AlignAside } from './styles/common'
import LogoSVG from './asserts/logo.svg?react';
import { Wrap, AppHeader, HeaderContent, AppMain, TabPanel, Logo, BottomNav, NavItem, ModeSwitch, SwitchTrack, SwitchLabel } from './styles/App'
import UserInfo, { User } from 'user-info'

export default () => {
  const store = useSnapshot(global)
  const user = useSnapshot(User);
  const [activeTab, setActiveTab] = useState<'planner' | 'dishes'>('planner')

  const [localState, localStore] = useLocalProxy({
    booted: false,
    loading: false,
  });

  const init = useCallback(async () => {
    try {
      global.app.access_token = user.access_token;
      global.app.refresh_token = user.refresh_token;
      const kinds = await getKinds()
      global.kinds = kinds;
      const dishes = await getDishes({ with: 'kind' })
      global.dishes = dishes
    } catch (err) {

    }
  }, [])
  useEffect(() => {
    if (!localState.booted && user.access_token) {
      localStore.booted = true
      init()
    }
  }, [user.access_token])
  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const refresh_token = search.get('refresh_token')
    if (refresh_token) {
      User.setRefreshToken(refresh_token)
      window.location.replace(window.location.origin + window.location.pathname)
    }
  }, [])
  return (
    <Wrap>
      <AppHeader>
        <HeaderContent className={AlignAside}>
          <Logo>
            <LogoSVG style={{ width: 30, height: 30 }} />
            <h1>吃什么</h1>
          </Logo>

          <ModeSwitch>
            <SwitchTrack
              className={store.compactMode ? 'on' : ''}
              role="switch"
              aria-checked={store.compactMode}
              aria-label="精简模式"
              onClick={() => global.toggleCompactMode()}
              title={store.compactMode ? '当前：精简，点击切换为详细' : '当前：详细，点击切换为精简'}
            >
              <i className="knob" />
            </SwitchTrack>
            <SwitchLabel>{store.compactMode ? '精简' : '详细'}</SwitchLabel>
          </ModeSwitch>

          <UserInfo onLogout={() => {
            global.dateRecordsMap.clear()
          }} />
        </HeaderContent>
      </AppHeader>

      {/* 两个页面常驻挂载，切换 Tab 只切换可见性，组件状态（滚动、筛选、弹窗、月份等）得以保留 */}
      <AppMain>
        <TabPanel data-active={activeTab === 'planner'}>
          <MealPlanner />
        </TabPanel>
        <TabPanel data-active={activeTab === 'dishes'}>
          <DishManager />
        </TabPanel>
      </AppMain>

      <BottomNav>
        <NavItem
          className={activeTab === 'planner' ? 'active' : ''}
          onClick={() => setActiveTab('planner')}
        >
          <CalendarDays size={22} strokeWidth={2} />
          <span className="label">{formatDate(store.currentDateTime, 'yyyy-MM')}</span>
        </NavItem>
        <NavItem
          className={activeTab === 'dishes' ? 'active' : ''}
          onClick={() => setActiveTab('dishes')}
        >
          <ChefHat size={22} strokeWidth={2} />
          <span className="label">菜品</span>
        </NavItem>
      </BottomNav>
    </Wrap>
  )
};
