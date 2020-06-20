import { join } from 'https://deno.land/std/path/mod.ts'
import { BufReader } from 'https://deno.land/std/io/mod.ts'
import { parse } from 'https://deno.land/std/encoding/csv.ts'

const compose = (...args: Function[]) => (x: any[]) =>
  args.reduce((v, f) => f(v), x)

interface Planet {
  koi_prad: number
  koi_disposition: string
  koi_smass: number
  koi_srad: number
}

// Filter functions
const planetRadiusFilter = (planets: any[]) => {
  return planets.filter(
    (planet: Planet) => planet.koi_srad > 0.99 && planet.koi_srad < 1.01
  )
}

const planetMassFilter = (planets: any[]) => {
  return planets.filter(
    (planet: Planet) => planet.koi_smass > 0.78 && planet.koi_smass < 1.04
  )
}
const planetSizeFilter = (planets: any[]) => {
  return planets.filter(
    (planet: Planet) => planet.koi_prad > 0.5 && planet['koi_prad'] < 1.5
  )
}

const planetsStatusFilter = (planets: any[]) => {
  return planets.filter(
    (planet: Planet) => planet.koi_disposition === 'CONFIRMED'
  )
}

const loadPlanetsDats = async () => {
  const path = join('.', 'original.csv')

  const file = await Deno.open(path)
  const bufReader = new BufReader(file)
  const result = await parse(bufReader, {
    header: true,
    comment: '#',
  })
  // Make sure to close all open files
  Deno.close(file.rid)

  const composedRes = compose(
    planetMassFilter,
    planetRadiusFilter,
    planetSizeFilter,
    planetsStatusFilter
  )(result)

  return composedRes
}

const newPlanets = await loadPlanetsDats()

const newPlanetsInfo = (planets: any[]) => {
  console.log(`We found ${planets.length} habitable planets. Here is a list of there names:`)
  return planets.forEach(planet => console.log(planet.kepler_name))
}

newPlanetsInfo(newPlanets)
