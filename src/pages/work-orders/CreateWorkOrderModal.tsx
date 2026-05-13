import { useState, useEffect } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';
import {
  ModalShell,
  modalShellPrimaryButtonLoadingStyle,
  modalShellPrimaryButtonStyle,
  modalShellSecondaryButtonStyle,
} from './ModalShell';
import { workOrderApi, deviceApi } from '../../api';
import type { CreateWorkOrderRequest, Device, WorkOrderPriority } from '../../types';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  /** 打开时预选的设备 id（需在设备下拉列表中存在） */
  initialDeviceId?: string;
  /** 遮罩 z-index，需高于设备详情等下层弹窗 */
  overlayZIndex?: number;
}

const PRIORITY_OPTIONS: { value: WorkOrderPriority; label: string }[] = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: '#666',
  marginBottom: '4px',
};

type FieldErrors = {
  title?: string;
  description?: string;
  deviceId?: string;
};

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} style={fieldLabelStyle}>
      {children}
      {required ? <span style={{ color: '#ff4d4f', marginLeft: '2px' }}>*</span> : null}
    </label>
  );
}

const fieldStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

/**
 * 在 `workOrderApi.create` → `JSON.stringify` 之前收口请求体：
 * - 字符串已由调用方 trim，此处只做「可 POST 的 JSON 对象」形状与业务校验；
 * - 确认 deviceId 仍落在当前下拉数据内，避免列表刷新后陈旧选项被提交；
 * - priority 收窄为合法枚举，与后端/Mock 约定一致。
 */
function buildCreateWorkOrderRequest(
  devices: Device[],
  input: { title: string; description: string; deviceId: string; priority: WorkOrderPriority },
): CreateWorkOrderRequest | null {
  if (!devices.some((d) => d.id === input.deviceId)) return null;
  const priority: WorkOrderPriority =
    input.priority === 'high' || input.priority === 'low' || input.priority === 'medium'
      ? input.priority
      : 'medium';
  return {
    title: input.title,
    description: input.description,
    deviceId: input.deviceId,
    priority,
  };
}

export function CreateWorkOrderModal({
  isOpen,
  onClose,
  onCreate,
  initialDeviceId,
  overlayZIndex = 1000,
}: CreateWorkOrderModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<WorkOrderPriority>('medium');
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const fetchDevices = async () => {
    try {
      const data = await deviceApi.getAll({});
      setDevices(data);
    } catch (e) {
      console.error('Failed to fetch devices:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDeviceId('');
      setError('');
      setFieldErrors({});
      void fetchDevices();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !initialDeviceId || devices.length === 0) return;
    if (devices.some((d) => d.id === initialDeviceId)) {
      setDeviceId(initialDeviceId);
    }
  }, [isOpen, initialDeviceId, devices]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const nextErrors: FieldErrors = {};
    if (!trimmedTitle) nextErrors.title = '请输入工单标题';
    if (!trimmedDescription) nextErrors.description = '请输入问题描述';
    if (!deviceId) nextErrors.deviceId = '请选择关联设备';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = buildCreateWorkOrderRequest(devices, {
      title: trimmedTitle,
      description: trimmedDescription,
      deviceId,
      priority,
    });
    if (!body) {
      setFieldErrors((prev) => ({
        ...prev,
        deviceId: '设备列表已更新，请重新选择关联设备',
      }));
      void fetchDevices();
      return;
    }

    setLoading(true);
    try {
      await workOrderApi.create(body);
      onCreate();
    } catch {
      setError('创建工单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      open={isOpen}
      width={480}
      zIndex={overlayZIndex}
      onClose={onClose}
      form={{ onSubmit: handleSubmit, noValidate: true }}
      slots={{
        title: '创建工单',
        body: (
          <div style={fieldStackStyle}>
            <div>
              <FieldLabel htmlFor="create-wo-title" required>
                工单标题
              </FieldLabel>
              <TextField
                id="create-wo-title"
                fullWidth
                size="small"
                margin="dense"
                hiddenLabel
                placeholder="请输入工单标题"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }}
                error={Boolean(fieldErrors.title)}
                helperText={fieldErrors.title}
                slotProps={{
                  htmlInput: { 'aria-label': '工单标题' },
                }}
              />
            </div>

            <div>
              <FieldLabel htmlFor="create-wo-device" required>
                关联设备
              </FieldLabel>
              <FormControl fullWidth size="small" error={Boolean(fieldErrors.deviceId)} hiddenLabel>
                <Select
                  id="create-wo-device"
                  displayEmpty
                  value={deviceId}
                  onChange={(ev: SelectChangeEvent<string>) => {
                    setDeviceId(ev.target.value);
                    if (fieldErrors.deviceId) setFieldErrors((prev) => ({ ...prev, deviceId: undefined }));
                  }}
                  inputProps={{ 'aria-label': '关联设备' }}
                  MenuProps={{
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span style={{ color: 'rgba(0,0,0,0.38)' }}>请选择设备</span>;
                    }
                    const d = devices.find((x) => x.id === selected);
                    return d ? `${d.name} (${d.buildingId})` : selected;
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>请选择设备</em>
                  </MenuItem>
                  {devices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name} ({device.buildingId})
                    </MenuItem>
                  ))}
                </Select>
                {fieldErrors.deviceId ? <FormHelperText>{fieldErrors.deviceId}</FormHelperText> : null}
              </FormControl>
            </div>

            <div>
              <span style={{ ...fieldLabelStyle, cursor: 'default' }}>优先级</span>
              <RadioGroup
                row
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
                sx={{ gap: 2 }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio size="small" />}
                    label={option.label}
                    sx={{ m: 0, mr: 0 }}
                  />
                ))}
              </RadioGroup>
            </div>

            <div>
              <FieldLabel htmlFor="create-wo-description" required>
                问题描述
              </FieldLabel>
              <TextField
                id="create-wo-description"
                fullWidth
                multiline
                minRows={4}
                size="small"
                margin="dense"
                hiddenLabel
                placeholder="请详细描述问题..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: undefined }));
                }}
                error={Boolean(fieldErrors.description)}
                helperText={fieldErrors.description}
                slotProps={{
                  htmlInput: { 'aria-label': '问题描述' },
                }}
              />
            </div>

            {error ? (
              <Alert severity="error" sx={{ py: 0.5 }}>
                {error}
              </Alert>
            ) : null}
          </div>
        ),
        footer: (
          <>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                ...modalShellSecondaryButtonStyle,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...(loading ? modalShellPrimaryButtonLoadingStyle : modalShellPrimaryButtonStyle),
              }}
            >
              {loading ? '创建中…' : '创建工单'}
            </button>
          </>
        ),
      }}
    />
  );
}
