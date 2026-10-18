import { useRef } from 'react'
import { useSnapshot } from 'valtio'
import { Trash2, Plus, PencilLine, X, Loader2 } from 'lucide-react'
import global, { useLocalProxy, type IDish } from '../global'
import { createDish, createKind, destryDish, destryKind, updateDish, getDish } from '../apis'
import { FullWidth, Button, Mask, Modal, ModalFooter, ModalHeader, ModalContent, } from '../styles/common';
import RichTextEditor from './RichTextEditor'

import {
  Main,
  DishForm,
  FormGroup,
  input_select,
  DishesList,
  DishesGrid,
  DishCard,
  DishInfo,
  Operation,
  CategoryLabel,
  EditField,
  EditFieldLabel,
  EditLoading,
} from '../styles/DishManager'

const DishManager = () => {
  const [localState, localProxy] = useLocalProxy<{
    newDishKindId: string;
    newDishTitle: string;
    newKindId: string;
    newKindTitle: string;
    editDish: Partial<IDish> | null;
    editLoading: boolean;
    setKV: Function;
  }>({
    newDishTitle: '',
    newDishKindId: '',
    newKindId: '',
    newKindTitle: '',
    editDish: null,
    editLoading: false,
    setKV(k: string, v: any) {
      //@ts-ignore
      this[k] = v
    }
  })
  const store = useSnapshot(global)
  // 标记当前编辑请求，避免关闭弹窗后旧请求回来又把弹窗打开
  const editSeq = useRef(0)

  /** 打开编辑：先用列表里的基础字段占位，再拉取完整详情（含 content） */
  const openEdit = async (dish: IDish) => {
    const seq = ++editSeq.current
    localProxy.setKV('editDish', { id: dish.id, title: dish.title, kind_id: dish.kind_id })
    localProxy.setKV('editLoading', true)
    try {
      const info = await getDish(dish.id)
      if (seq !== editSeq.current) return
      localProxy.setKV('editDish', { ...info })
    } catch (err: any) {
      if (seq !== editSeq.current) return
      alert('获取菜品详情失败：' + (err?.message || '请稍后重试'))
      localProxy.setKV('editDish', null)
    } finally {
      if (seq === editSeq.current) {
        localProxy.setKV('editLoading', false)
      }
    }
  }

  const closeEdit = () => {
    editSeq.current++
    localProxy.setKV('editDish', null)
    localProxy.setKV('editLoading', false)
  }

  const addDish = async () => {
    if (!localState.newDishKindId.trim() || !localState.newDishTitle.trim()) {
      alert('请输入菜品名称和分类')
      return
    }

    const data = {
      title: localState.newDishTitle.trim(),
      kind_id: localState.newDishKindId,
    }
    const result = await createDish(data)
    if (result.success) {
      const kind = store.kinds.find(k => k.id === data.kind_id)
      result.data.info.kind = kind ? kind : { title: 'None' }
      global.addDish(result.data.info)
      localProxy.setKV('newDishTitle', '')
      const inputs = document.querySelectorAll<HTMLInputElement>('#add-dish input')
      inputs.forEach((o) => {
        o.value = '';
      });
    } else {
      return alert('添加失败 ' + result.message)
    }
  }
  const putDish = async (id: string, title: string, content: string) => {
    const result = await updateDish(id, { title, content })
    if (result.success) {
      // 列表只保留轻量字段，content 不入 store
      global.putDish(id, { title })
      closeEdit()
    } else {
      return alert('保存失败 ' + result.message)
    }
  }

  const deleteDish = async (id: string) => {
    const result = await destryDish(id)
    if (result.success) {
      global.delDish(id)
    } else {
      return alert('删除失败 ' + result.message)
    }
  }

  const addKind = async () => {
    if (!localState.newKindId.trim() || !localState.newKindTitle.trim()) {
      alert('请输入分类')
      return
    }

    const data = {
      id: localState.newKindId.trim(),
      title: localState.newKindTitle.trim(),
    }
    const result = await createKind(data)
    if (result.success) {
      store.addKind(result.data.info)
      localProxy.setKV('newKindId', '')
      localProxy.setKV('newKindTitle', '')
      const inputs = document.querySelectorAll<HTMLInputElement>('#add-kind input')
      inputs.forEach(o => {
        o.value = '';
      });
    } else {
      return alert('添加失败 ' + result.message)
    }
  }

  const deleteKind = async (id: string) => {
    const result = await destryKind(id)
    if (result.success) {
      global.delKind(id)
    } else {
      return alert('删除失败 ' + result.message)
    }
  }

  return (
    <Main>
      <DishForm>
        <h3>添加菜品</h3>
        <FormGroup id="add-dish" >
          <input
            type="text"
            placeholder="菜品名称"
            defaultValue={localState.newDishTitle}
            onChange={(e) => {
              localProxy.setKV('newDishTitle', e.target.value)
            }}
            className={input_select}
          />
        </FormGroup>
        <FormGroup>
          <div className={FullWidth}>
            {store.kinds.map(kind => (
              <div key={kind.id} style={{ whiteSpace: 'nowrap' }} onTouchStart={() => {
                localProxy.setKV('newDishKindId', kind.id)
              }} onClick={() => {
                localProxy.setKV('newDishKindId', kind.id)
              }}>
                <input type="radio" readOnly name="newKindId" value={kind.id} checked={localState.newDishKindId === kind.id} />
                {kind.title}
              </div>
            ))}
          </div>
        </FormGroup>
        <Button onClick={addDish} className="add">
          <Plus size={18} /> 添加菜品
        </Button>


        <DishesList>
          <h3>分类列表 ({store.kinds.length})</h3>
          {store.kinds.length === 0 ? (
            <p className="empty-text">还没有分类，请先添加</p>
          ) : (
            <DishesGrid>
              {store.kinds.map(kind => (
                <DishCard key={kind.id} >
                  <DishInfo>
                    <h4>{kind.title}</h4>
                  </DishInfo>
                  <Operation>
                    <Button
                      onClick={() => deleteKind(kind.id)}
                      className="delete"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </Operation>
                </DishCard>
              ))}
            </DishesGrid>
          )}
        </DishesList>
        <FormGroup id="add-kind" style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <input
            type="text"
            placeholder="新分类id"
            defaultValue={localState.newKindId}
            style={{ flex: 1 }}
            onChange={(e) => {
              localProxy.setKV('newKindId', e.target.value)
            }}
            className={input_select}
          />
          <input
            type="text"
            placeholder="新分类名称"
            defaultValue={localState.newKindTitle}
            style={{ flex: 1 }}
            onChange={(e) => {
              localProxy.setKV('newKindTitle', e.target.value)
            }}
            className={input_select}
          />
        </FormGroup>
        <Button onClick={addKind} className="add">
          <Plus size={18} /> 添加分类
        </Button>
      </DishForm>

      <DishesList>
        <h3>菜品列表 ({store.dishes.length})</h3>
        {store.dishes.length === 0 ? (
          <p className="empty-text">还没有菜品，请先添加</p>
        ) : (
          <DishesGrid>
            {store.dishes.map(dish => (
              <DishCard key={dish.id} >
                <DishInfo>
                  <h4>{dish.title}</h4>
                  <CategoryLabel>{dish.kind?.title}</CategoryLabel>
                </DishInfo>
                <Operation>
                  <Button
                    onClick={() => deleteDish(dish.id)}
                    className="delete"
                  >
                    <Trash2 size={18} />
                  </Button>
                  <Button
                    className="delete"
                    onClick={() => openEdit(dish)}
                  >
                    <PencilLine size={16} />
                  </Button>
                </Operation>
              </DishCard>
            ))}
          </DishesGrid>
        )}
      </DishesList>
      {
        localState.editDish && <Mask>
          <Modal>
            <ModalHeader>
              <h3>编辑菜品</h3>
              <div onClick={closeEdit}>
                <X size={24} />
              </div>
            </ModalHeader>
            <ModalContent>
              {localState.editLoading ? (
                <EditLoading>
                  <Loader2 size={18} className="spin" />
                  正在获取菜品详情…
                </EditLoading>
              ) : (
                <>
                  <EditField>
                    <EditFieldLabel>菜品名称</EditFieldLabel>
                    {/* 非受控输入：避免中文输入法组合期间被 React 回写 value 造成重复字母 */}
                    <input
                      name="edit_dish"
                      className={input_select}
                      defaultValue={localState.editDish.title || ''}
                      onChange={e => { localProxy.setKV('editDish', { ...localState.editDish, title: e.target.value }) }}
                    />
                  </EditField>
                  <EditField>
                    <EditFieldLabel>菜品内容</EditFieldLabel>
                    <RichTextEditor
                      key={localState.editDish.id}
                      defaultValue={localState.editDish.content || ''}
                      placeholder="记录做法、配料、口味备注…… 支持加粗、列表、小标题"
                      onChange={(html) => {
                        localProxy.setKV('editDish', { ...localState.editDish, content: html })
                      }}
                    />
                  </EditField>
                </>
              )}
            </ModalContent>

            <ModalFooter>
              <Button className='close' onClick={closeEdit}>取消</Button>
              <Button className='add' onClick={() => {
                if (localState.editLoading) return
                //@ts-ignore
                putDish(localState.editDish.id, localState.editDish.title, localState.editDish.content || '')
              }}>确定</Button>
            </ModalFooter>
          </Modal>
        </Mask>
      }
    </Main>
  )
}

export default DishManager