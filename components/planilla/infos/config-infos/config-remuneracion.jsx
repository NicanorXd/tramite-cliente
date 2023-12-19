import React, { useMemo, useState } from 'react';
import Modal from '../../../modal';
import { Checkbox, Input, Button } from 'semantic-ui-react';
import { SelectPim, SelectTypeRemuneration } from '../../../select/micro-planilla';
import { microPlanilla } from '../../../../services/apis';
import { useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import Show from '../../../show';
import { Confirm } from '../../../../services/utils';
import Swal from 'sweetalert2';

const Placeholder = () => {
  const data = [1, 2, 3, 4];
  return data.map(d => 
    <tr>
      <td><Skeleton/></td>
      <td><Skeleton/></td>
      <td><Skeleton/></td>
      <td><Skeleton/></td>
    </tr>
  );  
}

const ItemTypeRemuneration = ({ infoTypeRemuneration = {}, disabled = false, onUpdate = null, onDelete = null }) => {

  const { typeRemuneration } = infoTypeRemuneration;

  const [amount, setAmount] = useState(infoTypeRemuneration.amount);
  const [isBase, setIsBase] = useState(infoTypeRemuneration.isBase);
  const [pimId, setPimId] = useState(infoTypeRemuneration.pimId);
  const [isEdit, setIsEdit] = useState(false);
  const [option, setOption] = useState("");
  const [currentLoading, setCurrentLoading] = useState(false);

  const background = '#e1f5fe';

  const events = {
    UPDATE: "UPDATE",
    DELETE: "DELETE"
  }

  const reset = () => {
    setAmount(infoTypeRemuneration.amount);
    setIsBase(infoTypeRemuneration.isBase);
  }

  const handleUpdate = async () => {
    const answer = await Confirm('warning', `¿Estás seguro en actualizar los datos?`);
    if (!answer) return;
    setOption(events.UPDATE);
    setCurrentLoading(true);
    const currentAmount = parseFloat(`${amount ? amount : 0}`);
    const payload = Object.assign({}, {
      amount: currentAmount,
      isBase,
      pimId: parseInt(pimId) || null
    });
    await microPlanilla.put(`infoTypeRemunerations/${infoTypeRemuneration.id}`, payload)
      .then(res => {
        Swal.fire({
          icon: 'success',
          text: 'Los datos se actualizaron correctamente!'
        })
        // disabled edit
        setIsEdit(false);
        // send event
        if (typeof onUpdate == 'function') onUpdate(res.data);
      }).catch(() => Swal.fire({
        icon: 'error',
        text: 'No se pudo actualizar los datos'
      }))
    setCurrentLoading(false);
  }

  const handleDelete = async () => {
    const answer = await Confirm('warning', `¿Estás seguro en eliminar los regístros?`);
    if (!answer) return;
    setOption(events.DELETE);
    setCurrentLoading(true);
    await microPlanilla.delete(`infoTypeRemunerations/${infoTypeRemuneration.id}`)
      .then(() => {
        Swal.fire({
          icon: 'success',
          text: 'Los datos se eliminaron correctamente!'
        })
        // send event
        if (typeof onDelete == 'function') onDelete();
      }).catch(() => Swal.fire({
        icon: 'error',
        text: 'No se pudo eliminar los datos'
      }))
    setCurrentLoading(false);
  }

  useEffect(() => {
    if (!isEdit && !currentLoading) reset();
  }, [isEdit])

  return (
    <tr style={isEdit ? { background } : {}}>
      <td>
        <span className='badge badge-dark mr-2'>{typeRemuneration?.code}</span>
        <b>{typeRemuneration?.name}</b>
      </td>
      <td className='text-center'>
        <Show condicion={isEdit}
          predeterminado={
            <Input type='text'
              fluid
              value={
                infoTypeRemuneration?.pimId ? `Meta ${infoTypeRemuneration?.pim?.code} - ${infoTypeRemuneration?.pim?.cargo?.extension}`
                  : 'N/A'
              }
            />}
        >
          <SelectPim
            name="pimId"
            value={pimId || ''}
            year={new Date().getFullYear()}
            onChange={(e, obj) => setPimId(obj.value)}
            disabled={currentLoading}
          />
        </Show>
      </td>
      <td>
        <Input fluid
          type='number'
          name='amount'
          readOnly={!isEdit || currentLoading}
          onChange={(e, obj) => setAmount(parseFloat(`${obj.value}`))}
          value={amount}
          disabled={disabled}
        />
      </td>
      <td className='text-center'>
        <Checkbox toggle
          name='isBase'
          onChange={(e, obj) => setIsBase(obj.checked)}
          checked={isBase}
          readOnly={!isEdit || currentLoading}
          disabled={disabled}
        />
      </td>
      <td className='text-right'>
        <Button.Group size='mini'>
          <Show condicion={isEdit} predeterminado={
            <>
              <Button color='red'
                disabled={currentLoading || disabled}
                loading={(currentLoading && option == events.DELETE)}
                onClick={handleDelete}
              >
                <i className="fas fa-trash"></i>
              </Button>
              <Button color='blue'
                basic
                onClick={() => setIsEdit(true)}
                disabled={currentLoading || disabled}
              >
                <i className="fas fa-pencil-alt"></i>
              </Button>
            </>
          }>
            <Button color='blue'
              onClick={handleUpdate}
              disabled={currentLoading || disabled}
              loading={(currentLoading && option == events.UPDATE)}
            >
              <i className="fas fa-sync"></i>
            </Button>
            <Button color='red'
              disabled={currentLoading || disabled}
              onClick={() => setIsEdit(false)}
            >
              <i className="fas fa-times"></i>
            </Button>
          </Show>
        </Button.Group>
      </td>
    </tr>
  )
}

const CreateTypeRemuneration = ({ info = {}, onSave = null }) => {

  const [currentLoading, setCurrentLoading] = useState(false);
  const [form, setForm] = useState({
    isBase: true,
    amount: 0
  });

  const isCan = useMemo(() => {
    return form?.typeRemunerationId;
  }, [form]);

  const handleInput = ({ name, value }) => {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const handleIntToInput = ({ name, value }) => {
    const newValue = parseInt(`${value}`);
    handleInput({ name, value: newValue });
  }

  const handleFloatToInput = ({ name, value }) => {
    const newValue = parseFloat(`${value}`);
    handleInput({ name, value: newValue });
  }

  const handleSave = async () => {
    const answer = await Confirm('warning', `¿Estás seguro en guardar los datos?`);
    if (!answer) return;
    setCurrentLoading(true);
    const payload = Object.assign({}, form);
    payload.infoId = info.id;
    payload.amount = form.amount ? form.amount : 0;
    await microPlanilla.post(`infoTypeRemunerations`, payload)
      .then(res => {
        Swal.fire({
          icon: 'success',
          text: 'Los datos se guardaron correctamente!'
        });
        // on event
        if (typeof onSave == 'function') onSave(res.data);
        // clear form
        setForm({ amount: 0, isBase: true });
      }).catch(() => Swal.fire({ 
        icon: 'error',
        text: 'No se pudo guardar los datos'
      }))
    // disabled loading
    setCurrentLoading(false);
  }

  return (
    <tr>
      <td>
        <SelectTypeRemuneration
          name="typeRemunerationId"
          value={form?.typeRemunerationId}
          onChange={(e, obj) => handleIntToInput(obj)}
          disabled={currentLoading}
        />
      </td>
      <td className='text-center'>
        <SelectPim
          name="pimId"
          value={form?.pimId}
          year={new Date().getFullYear()}
          onChange={(e, obj) => handleIntToInput(obj)}
          disabled={currentLoading}
        />
      </td>
      <td>
        <Input fluid
          type='number'
          name='amount'
          onChange={(e, obj) => handleFloatToInput(obj)}
          value={form?.amount}
          disabled={currentLoading}
        />
      </td>
      <td className='text-center'>
        <Checkbox toggle
          name='isBase'
          onChange={(e, obj) => handleInput({ ...obj, value: obj.checked })}
          checked={form?.isBase}
          disabled={currentLoading}
        />
      </td>
      <td className='text-right'>
        <Button color='teal'
          disabled={!isCan || currentLoading}
          onClick={handleSave}
          loading={currentLoading}
        >
          <i className="fas fa-save"></i> Guardar
        </Button>
      </td>
    </tr>
  )
}

const ConfigRemuneracion = ({ info = {}, disabled = false, onClose = null, onSave = null }) => {

  const [current_loading, setCurrentLoading] = useState(false);
  const [currentMeta, setCurrentMeta] = useState({});
  const [currentData, setCurrentData] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);

  const getData = async (add = false) => {
    setCurrentLoading(true);
    await microPlanilla.get(`infos/${info.id}/typeRemunerations?limit=100`)
      .then(res => {
        const { meta, items } = res.data;
        setCurrentMeta(meta)
        setCurrentData(prev => add ? [...prev, ...items] : items)
      }).catch(err => console.log(err))
    setCurrentLoading(false);
  }

  const handleSave = () => {
    setIsRefresh(true)
    if (typeof onSave == 'function') onSave();
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (isRefresh) getData();
  }, [isRefresh]);

  useEffect(() => {
    if (isRefresh) setIsRefresh(false);
  }, [isRefresh]);

  return (
    <Modal show={true}
      isClose={onClose}
      md=" col-lg-10 col-md-11"
      height="50%"
      disabled={current_loading}
      titulo={<span><i className="fas fa-cogs"></i> Configuración de Planilla</span>}
    >
      <div className="card-body">
        <table className='table table-striped'>
          <thead>
            <tr>
              <th width="30%">Remuneración</th>
              <th className='text-left' width='20%'>PIM</th>
              <th className='text-left' width='15%'>Monto</th>
              <th className='text-center' width='10%'>Base Imp.</th>
              <th className='text-right'>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {/* crear remuneraciones */}
            <CreateTypeRemuneration
              onSave={handleSave}
              info={info}
            />
            {/* listar remuneraciones */}
            {currentData.map((d, index) => 
              <ItemTypeRemuneration
                key={`list-item-type-remuneration-${index}`}
                infoTypeRemuneration={d}
                onUpdate={handleSave}
                onDelete={handleSave}
                disabled={disabled}
              />
            )}
            {/* loading */}
            <Show condicion={current_loading}>
              <Placeholder/>
            </Show>
          </tbody>
        </table>
      </div>
    </Modal>
  )
}

export default ConfigRemuneracion;