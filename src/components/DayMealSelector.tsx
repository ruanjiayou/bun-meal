import { X, Plus, Check, Eye, EyeOff } from 'lucide-react'
import { createRecord, destryRecord } from '../apis'
import { v7 } from 'uuid'
import global, { useLocalProxy, type IDish, type IRecord } from '../global'
import { useSnapshot } from 'valtio'
import { Button, Mask, Modal, ModalHeader, ModalContent, ModalFooter } from '../styles/common';
import {
  MealSection,
  MealTitle,
  SelectedDishesList,
  DishTagWrapper,
  DishTagContent,
  DishTagActions,
  RepeatCheck,
  EmptyText,
  DishesGrid,
  CategoryTitle,
  DishCell,
  DishCellChecked,
  DishCellRepeated
} from '../styles/DayMealSelector'
import type { MouseEventHandler } from 'react'

/** 早 / 中 / 晚 三餐配置 */
const MEALS = [
  { type: 'breakfast', title: '🌅 早餐' },
  { type: 'lunch', title: '🍴 午餐' },
  { type: 'dinner', title: '🍽️ 晚餐' },
]

const mealTitle = (type: string) => MEALS.find(m => m.type === type)?.title || ''

const DayMealSelector = ({ date, onChange, onClose }: { date: string, onChange: Function, onClose: MouseEventHandler<HTMLDivElement> }) => {
  const store = useSnapshot(global)

  const todayDishes = store.getDateRecords(date) || []

  const [localState, localProxy] = useLocalProxy({
    showDishList: false,
    type: '',
    date,
    openDishes(type: string) {
      this.type = type
      this.showDishList = true;
    },
    closeDishes() {
      this.type = ''
      this.showDishList = false;
    },
  });

  const handleRemoveDish = async (record: IRecord) => {
    global.removeDateRecord(record)
    destryRecord(record.id)
  }

  const handleToggleDishRepeat = (id: String) => {
    // localProxy.toggleDishRepeat(id)
  }

  // 只在当前餐次（type）内判断与增删，避免午餐选了晚餐就选不了
  const handleToggleDish = async (dish: IDish) => {
    const type = localState.type
    const records = (global.getDateRecords(date) || []).filter(d => d.type === type)
    const record = records.find(d => d.dish_id === dish.id);
    if (record) {
      global.removeDateRecord(record)
      destryRecord(record.id)
    } else {
      const id = v7()
      const data = { id, dish_id: dish.id, date, type, can_repeated: 0, sn: 1, time: new Date() }
      global.addDateRecord({ ...data, dish })
      createRecord(data)
    }
  }

  const renderSection = (type: string, title: string) => {
    const dishes = todayDishes.filter(d => d.type === type)
    return (
      <MealSection key={type}>
        <MealTitle>{title}</MealTitle>
        <SelectedDishesList>
          {dishes.length > 0 ? (
            dishes.map(dish => {
              const key = `${type}_${dish.id}`
              return (
                <DishTagWrapper key={key} className={`${dish.repeated ? 'repeated' : ''}`}>
                  <DishTagContent>
                    {dish.dish?.title}
                  </DishTagContent>
                  <DishTagActions>
                    <RepeatCheck
                      className={`${dish.can_repeated ? 'enabled' : 'disabled'}`}
                      onClick={() => handleToggleDishRepeat(dish.id)}
                      title={dish.can_repeated ? '不参与重复判断' : '参与重复判断'}
                    >
                      {dish.can_repeated ? <Eye size={12} /> : <EyeOff size={12} />}
                    </RepeatCheck>
                    <Button
                      className='delete'
                      onClick={() => handleRemoveDish(dish)}
                      title="删除菜品"
                    >
                      ×
                    </Button>
                  </DishTagActions>
                </DishTagWrapper>
              )
            })
          ) : (
            <EmptyText>未选择菜品</EmptyText>
          )}
        </SelectedDishesList>
        <Button className='add'
          onClick={() => {
            localProxy!.openDishes(type);
          }}
        >
          <Plus size={16} /> 添加菜品
        </Button>
      </MealSection>
    )
  }

  return (
    <Mask onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{date}</h3>
          <div onClick={onClose}>
            <X size={24} />
          </div>
        </ModalHeader>

        <ModalContent>
          {MEALS.map((meal, idx) => (
            <div key={meal.type} style={idx < MEALS.length - 1 ? { marginBottom: 20 } : undefined}>
              {renderSection(meal.type, meal.title)}
            </div>
          ))}
        </ModalContent>
      </Modal>
      {/* 菜品选择弹框 */}
      {localState!.showDishList && (
        <DishSelectorOverlay
          date={date}
          type={localState.type}
          onToggleDish={handleToggleDish}
          onClose={() => { localProxy!.closeDishes(); global.setSelectedDate('') }}
        />
      )}
    </Mask>
  )
}

// 菜品选择组件
const DishSelectorOverlay = ({ date, type, onToggleDish, onClose }: any) => {
  const store = useSnapshot(global)
  const selectedDishes = store.getDateRecords(date) || []
  const dishsByCategory = store.kinds.map(kind => {
    return {
      kind,
      dishes: store.dishes.filter(d => d.kind_id === kind.id)
    }
  })
  return (
    <Mask onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>选择菜品 · {mealTitle(type).replace(/^\S+\s*/, '')}</h3>
          <div onClick={onClose}>
            <X size={24} />
          </div>
        </ModalHeader>

        <ModalContent>
          {/* 分类栏显示所有菜品 */}
          {dishsByCategory.map(({ kind, dishes }) => (
            <div key={kind.id} style={{ marginBottom: 10 }}>
              <CategoryTitle>{kind.title}</CategoryTitle>
              <DishesGrid>
                {dishes.map(dish => {
                  // 只把「当前餐次」已选中的菜品标记为已选
                  const isSelected = selectedDishes.some(d => d.dish_id === dish.id && d.type === type)
                  const isRepeated = dish.repeated
                  return (
                    <DishCell
                      key={dish.id}
                      className={`${isSelected ? 'selected' : ''} ${isRepeated ? 'repeated' : ''}`}
                      onClick={() => onToggleDish(dish, !isSelected)}
                      title={isRepeated ? '该菜品最近7天内有重复' : ''}
                    >
                      <span className="dish-cell-name">{dish.title}</span>
                      {isSelected && (
                        <DishCellChecked>
                          <Check size={16} />
                        </DishCellChecked>
                      )}
                      {isRepeated && (
                        <DishCellRepeated title="重复菜品">⚠️</DishCellRepeated>
                      )}
                    </DishCell>
                  )
                })}
              </DishesGrid>
            </div>
          ))}
        </ModalContent>
        <ModalFooter>
          <Button onClick={onClose} className="add">完成</Button>
        </ModalFooter>
      </Modal>
    </Mask>
  )
}

export default DayMealSelector
