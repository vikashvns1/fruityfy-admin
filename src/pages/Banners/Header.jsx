const Header = ({ title, back }) => (
  <div className="flex items-center gap-4 mb-6">
    <button onClick={back} className="p-2 border rounded">
      <MdArrowBack />
    </button>
    <h1 className="text-2xl font-bold text-[#064E3B]">{title}</h1>
  </div>
);

const ImagePicker = ({ preview, onChange }) => (
  <div className="border-2 border-dashed rounded-xl p-6 text-center relative">
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="absolute inset-0 opacity-0 cursor-pointer"
    />
    {preview ? (
      <img src={preview} className="h-48 mx-auto object-contain" />
    ) : (
      <>
        <MdCloudUpload size={48} className="mx-auto text-gray-400" />
        <p className="text-gray-400">Click to upload banner</p>
      </>
    )}
  </div>
);

const Inputs = ({ formData, setFormData }) => (
  <>
    <div className="grid grid-cols-1 gap-4">
      {['title','subtitle','cta_text','click_url'].map(k => (
        <input
          key={k}
          placeholder={k.replace('_',' ').toUpperCase()}
          value={formData[k] || ''}
          onChange={e => setFormData({ ...formData, [k]: e.target.value })}
          className="p-3 border rounded"
        />
      ))}
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Select label="Text Align" field="text_align" data={formData} set={setFormData} options={['left','center','right']} />
      <Select label="Overlay" field="overlay" data={formData} set={setFormData} options={['dark','light','none']} />
      <Select label="Position" field="position" data={formData} set={setFormData}
        options={[
          'home_main','home_middle','sidebar','footer'
        ]}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <input type="number" value={formData.sort_order}
        onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
        className="p-3 border rounded"
      />
      <Select label="Status" field="is_active" data={formData} set={setFormData}
        options={[[1,'Active'],[0,'Inactive']]}
      />
    </div>
  </>
);

const Select = ({ label, field, data, set, options }) => (
  <select
    value={data[field]}
    onChange={e => set({ ...data, [field]: e.target.value })}
    className="p-3 border rounded bg-white"
  >
    {options.map(o =>
      Array.isArray(o)
        ? <option key={o[0]} value={o[0]}>{o[1]}</option>
        : <option key={o} value={o}>{o}</option>
    )}
  </select>
);
