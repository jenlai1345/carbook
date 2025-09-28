// pages/inventory/new.tsx
import * as React from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Autocomplete,
  Divider,
  Stack,
} from "@mui/material";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Parse from "../../lib/parseClient";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CarToolbar from "@/components/CarToolbar";

/* -------------------- styles -------------------- */
const SaveButton = styled(Button)(({ theme }) => ({
  display: "block",
  marginLeft: "auto",
  marginRight: "auto", // center horizontally
  width: "100%", // mobile: full width
  [theme.breakpoints.up("sm")]: { width: "50%" }, // ≥sm: 30%
  textTransform: "none",
  fontWeight: 700,
  fontSize: 20,
  borderRadius: 10,
  "&:hover": { boxShadow: theme.shadows[4], transform: "translateY(-1px)" },
}));
/* -------------------- utils -------------------- */
function useDebounce<T>(v: T, delay = 350) {
  const [d, setD] = React.useState(v);
  React.useEffect(() => {
    const t = setTimeout(() => setD(v), delay);
    return () => clearTimeout(t);
  }, [v, delay]);
  return d;
}
type Option = { id: string; name: string };

async function ensureBrandByName(name: string): Promise<string> {
  const q = new Parse.Query("Brand");
  q.equalTo("name", name.trim());
  const exist = await q.first();
  if (exist) return exist.id ?? "";
  const Brand = Parse.Object.extend("Brand");
  const b = new Brand();
  b.set("name", name.trim());
  const saved = await b.save(); // make sure CLP allows create for logged-in users
  return saved.id;
}

async function ensureSeriesByName(
  name: string,
  brandId: string
): Promise<string> {
  const Brand = Parse.Object.extend("Brand");
  const brandPtr = Brand.createWithoutData(brandId);
  const q = new Parse.Query("Series");
  q.equalTo("name", name.trim());
  q.equalTo("brand", brandPtr);
  const exist = await q.first();
  if (exist) return exist.id ?? "";
  const Series = Parse.Object.extend("Series");
  const s = new Series();
  s.set("name", name.trim());
  s.set("brand", brandPtr);
  const saved = await s.save();
  return saved.id;
}

/* -------------------- schema -------------------- */
const headerSchema = z.object({
  plateNo: z.string().min(1, "必填"),
  prevPlateNo: z.string().optional().or(z.literal("")),
  deliverDate: z.string().optional().or(z.literal("")), // YYYY-MM-DD
  // brand/series keep both id + name
  brandId: z.string().optional().or(z.literal("")),
  brandName: z.string().min(1, "必填"),
  seriesId: z.string().optional().or(z.literal("")),
  seriesName: z.string().optional().or(z.literal("")),
  style: z.string().optional().or(z.literal("")),
  buyPriceWan: z.string().optional().or(z.literal("")),
  sellPriceWan: z.string().optional().or(z.literal("")),
});

const basicSchema = z.object({
  factoryYM: z.string().optional().or(z.literal("")),
  plateYM: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  displacementCc: z.string().optional().or(z.literal("")),
  transmission: z.enum(["A", "M", ""]).optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  engineNo: z.string().optional().or(z.literal("")),
  vin: z.string().optional().or(z.literal("")),
  dealer: z.string().optional().or(z.literal("")),
  equipment: z.string().optional().or(z.literal("")),
  remark: z.string().optional().or(z.literal("")),
  condition: z.string().optional().or(z.literal("")),
  inboundDate: z.string().optional().or(z.literal("")),
  promisedDate: z.string().optional().or(z.literal("")),
  returnDate: z.string().optional().or(z.literal("")),
  disposition: z.string().optional().or(z.literal("")),
});

const formSchema = headerSchema.and(basicSchema);
type FormValues = z.infer<typeof formSchema>;

/* -------------------- helpers -------------------- */
function a11yProps(i: number) {
  return { id: `inv-tab-${i}`, "aria-controls": `inv-tabpanel-${i}` };
}
function TabPanel({
  children,
  value,
  index,
}: {
  children?: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

/* ==================== Page ==================== */
export default function InventoryNewPage() {
  const [tab, setTab] = React.useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plateNo: "",
      prevPlateNo: "",
      deliverDate: "",
      brandId: "",
      brandName: "",
      seriesId: "",
      seriesName: "",
      style: "",
      buyPriceWan: "",
      sellPriceWan: "",
      factoryYM: "",
      plateYM: "",
      model: "",
      displacementCc: "",
      transmission: "",
      color: "",
      engineNo: "",
      vin: "",
      dealer: "",
      equipment: "",
      remark: "",
      condition: "",
      inboundDate: "",
      promisedDate: "",
      returnDate: "",
      disposition: "",
    },
  });

  // watch brandId to filter series list
  const watchedBrandId = useWatch({ control, name: "brandId" });
  const watchedBrandName = useWatch({ control, name: "brandName" });

  /* --------- remote Autocomplete options --------- */
  const [brandOpts, setBrandOpts] = React.useState<Option[]>([]);
  const [brandInput, setBrandInput] = React.useState("");
  const debBrand = useDebounce(brandInput);

  const [seriesOpts, setSeriesOpts] = React.useState<Option[]>([]);
  const [seriesInput, setSeriesInput] = React.useState("");
  const debSeries = useDebounce(seriesInput);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const q = new Parse.Query("Brand");
      if (debBrand) q.matches("name", debBrand, "i");
      q.ascending("name").limit(20);
      const r = await q.find();
      if (active)
        setBrandOpts(
          r
            .map((x) => ({ id: x.id!, name: x.get("name") }))
            .filter((option) => option.id !== undefined)
        );
    })();
    return () => {
      active = false;
    };
  }, [debBrand]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const q = new Parse.Query("Series");
      if (watchedBrandId) {
        const Brand = Parse.Object.extend("Brand");
        q.equalTo("brand", Brand.createWithoutData(watchedBrandId));
      }
      if (debSeries) q.matches("name", debSeries, "i");
      q.ascending("name").limit(20);
      const r = await q.find();
      if (active)
        setSeriesOpts(
          r
            .map((x) => ({ id: x.id || "", name: x.get("name") }))
            .filter((option) => option.id !== "")
        );
    })();
    return () => {
      active = false;
    };
  }, [debSeries, watchedBrandId]);

  /* --------- submit --------- */
  const onSubmit = async (v: FormValues) => {
    // Ensure we have valid Brand pointer
    let brandId = v.brandId;
    if (!brandId && v.brandName) {
      brandId = await ensureBrandByName(v.brandName);
      setValue("brandId", brandId);
    }
    // Ensure Series (optional)
    let seriesId = v.seriesId;
    if (!seriesId && v.seriesName && brandId) {
      seriesId = await ensureSeriesByName(v.seriesName, brandId);
      setValue("seriesId", seriesId);
    }

    const Car = Parse.Object.extend("Car");
    const car = new Car();

    // pointers
    if (brandId) {
      const Brand = Parse.Object.extend("Brand");
      car.set("brand", Brand.createWithoutData(brandId));
    }
    if (seriesId) {
      const Series = Parse.Object.extend("Series");
      car.set("series", Series.createWithoutData(seriesId));
    }

    // top fixed fields
    car.set("plateNo", v.plateNo);
    car.set("prevPlateNo", v.prevPlateNo || null);
    car.set("deliverDate", v.deliverDate || null);
    car.set("style", v.style || null);
    car.set("buyPriceWan", v.buyPriceWan ? Number(v.buyPriceWan) : null);
    car.set("sellPriceWan", v.sellPriceWan ? Number(v.sellPriceWan) : null);

    // 基本 tab
    car.set("factoryYM", v.factoryYM || null);
    car.set("plateYM", v.plateYM || null);
    car.set("model", v.model || null);
    car.set(
      "displacementCc",
      v.displacementCc ? Number(v.displacementCc) : null
    );
    car.set("transmission", v.transmission || null);
    car.set("color", v.color || null);
    car.set("engineNo", v.engineNo || null);
    car.set("vin", v.vin || null);
    car.set("dealer", v.dealer || null);
    car.set("equipment", v.equipment || null);
    car.set("remark", v.remark || null);
    car.set("condition", v.condition || null);
    car.set("inboundDate", v.inboundDate || null);
    car.set("promisedDate", v.promisedDate || null);
    car.set("returnDate", v.returnDate || null);
    car.set("disposition", v.disposition || null);

    await car.save();
    alert("✅ 已新建立車籍資料");
  };

  /* --------- UI helpers for Autocomplete values --------- */
  const brandValue = React.useMemo(() => {
    const id = getValues("brandId");
    const name = getValues("brandName");
    return id ? brandOpts.find((o) => o.id === id) ?? null : name || null;
  }, [brandOpts, getValues("brandId"), getValues("brandName")]);

  const seriesValue = React.useMemo(() => {
    const id = getValues("seriesId");
    const name = getValues("seriesName");
    return id ? seriesOpts.find((o) => o.id === id) ?? null : name || null;
  }, [seriesOpts, getValues("seriesId"), getValues("seriesName")]);

  /* -------------------- render -------------------- */
  return (
    <div>
      <CarToolbar
        breadcrumbs={[
          { label: "首頁", href: "/dashboard", showHomeIcon: true },
          { label: "車籍資料" },
        ]}
      />
      ;
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Fixed top section */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="plateNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="車號"
                    required
                    fullWidth
                    error={!!errors.plateNo}
                    helperText={errors.plateNo?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="prevPlateNo"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="原車號" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="deliverDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="交車日（年/月/日）"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* 車系 */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="seriesName"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    options={seriesOpts}
                    getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
                    value={seriesValue}
                    onInputChange={(_, v) => {
                      field.onChange(v);
                      setSeriesInput(v);
                      setValue("seriesId", "");
                    }}
                    onChange={(_, v) => {
                      if (typeof v === "string") {
                        setValue("seriesName", v);
                        setValue("seriesId", "");
                      } else if (v) {
                        setValue("seriesName", v.name);
                        setValue("seriesId", v.id);
                      } else {
                        setValue("seriesName", "");
                        setValue("seriesId", "");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="車系" fullWidth />
                    )}
                  />
                )}
              />
            </Grid>

            {/* --- 2nd row starts here because md: 6+6+6+3+3 = 24 --- */}
            {/* 廠牌 */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="brandName"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    options={brandOpts}
                    getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
                    value={brandValue}
                    onInputChange={(_, v) => {
                      field.onChange(v);
                      setBrandInput(v);
                      setValue("brandId", "");
                      /* reset series when brand type changes */ setValue(
                        "seriesId",
                        ""
                      );
                      setValue("seriesName", "");
                    }}
                    onChange={(_, v) => {
                      if (typeof v === "string") {
                        setValue("brandName", v);
                        setValue("brandId", "");
                        setValue("seriesId", "");
                        setValue("seriesName", "");
                      } else if (v) {
                        setValue("brandName", v.name);
                        setValue("brandId", v.id);
                        setValue("seriesId", "");
                        setValue("seriesName", "");
                      } else {
                        setValue("brandName", "");
                        setValue("brandId", "");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="廠牌"
                        required
                        error={!!errors.brandName}
                        helperText={errors.brandName?.message}
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="style"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="型式" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="buyPriceWan"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="進（萬）"
                    inputProps={{ inputMode: "decimal" }}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="sellPriceWan"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="賣（萬）"
                    inputProps={{ inputMode: "decimal" }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper
          variant="outlined"
          sx={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="基本" {...a11yProps(0)} />
            <Tab label="證件" {...a11yProps(1)} />
            <Tab label="入車" {...a11yProps(2)} />
            <Tab label="原車主" {...a11yProps(3)} />
            <Tab label="保險/貸款" {...a11yProps(4)} />
            <Tab label="新車主" {...a11yProps(5)} />
            <Tab label="付款" {...a11yProps(6)} />
            <Tab label="收款" {...a11yProps(7)} />
            <Tab label="費用" {...a11yProps(8)} />
          </Tabs>

          {/* 基本 */}
          <TabPanel value={tab} index={0}>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ p: 2 }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                基本資料
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Controller
                    name="factoryYM"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="month"
                        label="出廠（年/月）"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Controller
                    name="plateYM"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="month"
                        label="領牌（年/月）"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Model" fullWidth />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 4 }}>
                  <Controller
                    name="displacementCc"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="排氣量"
                        inputProps={{ inputMode: "numeric" }}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Controller
                    name="transmission"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        SelectProps={{ native: true }}
                        label="排檔（A/M）"
                        fullWidth
                      >
                        <option value=""></option>
                        <option value="A">A</option>
                        <option value="M">M</option>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="顏色" fullWidth />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="engineNo"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="引擎號碼" fullWidth />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="vin"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="車身號碼" fullWidth />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Controller
                    name="dealer"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="代理商" fullWidth />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 10 }}>
                  <Controller
                    name="equipment"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="配備" multiline fullWidth />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="remark"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="備註" multiline fullWidth />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="整備情形" fullWidth />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="inboundDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="date"
                        label="進廠日（年/月/日）"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="promisedDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="date"
                        label="預交日（年/月/日）"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="returnDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="date"
                        label="回公司日（年/月/日）"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 12 }}>
                  <Controller
                    name="disposition"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="處置" fullWidth />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <SaveButton
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  儲存
                </SaveButton>
              </Stack>
            </Box>
          </TabPanel>

          {/* other tabs placeholder */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <TabPanel key={i} value={tab} index={i}>
              <Box sx={{ p: 2, color: "text.secondary" }}>此分頁內容待補</Box>
            </TabPanel>
          ))}
        </Paper>
      </Container>
    </div>
  );
}
