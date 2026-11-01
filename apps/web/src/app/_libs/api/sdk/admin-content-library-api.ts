/*
 * UI demo build only: mock of the generated `AdminContentLibraryApi` (taxonomy: studios, genres,
 * tags, people) — same method names, request shapes and `{ data }` envelopes, answered in memory.
 * No request is ever sent.
 */
import type {
  AdminGenreResponseDto,
  AdminTagResponseDto,
  CreateGenreDto,
  CreatePersonDto,
  CreateStudioDto,
  CreateTagDto,
  PersonResponseDto,
  StudioResponseDto,
  TaxonomySummaryDto,
  UpdateGenreDto,
  UpdatePersonDto,
  UpdateStudioDto,
} from "@/app/_libs/api/generated";

import { conflict, newId, notFound, ok, paginate, slugify } from "./_demo/core";
import { mediaUrl } from "./_demo/media-store";

type Sort = "most_used" | "least_used" | "name" | string;
interface Named {
  id: string;
  name: string;
  contentCount: number;
}

export const studios: StudioResponseDto[] = [
  ["st1", "Marvel Studios", "US", 6],
  ["st2", "Yash Raj Films", "IN", 4],
  ["st3", "Warner Bros.", "US", 3],
  ["st4", "Dharma Productions", "IN", 2],
  ["st5", "Studio Dragon", "KR", 1],
  ["st6", "A24", "US", 0],
].map(([id, name, countryCode, contentCount]) => ({
  id: id as string,
  name: name as string,
  slug: slugify(name as string),
  logoMediaId: null,
  logoUrl: null,
  description: null,
  countryCode: countryCode as string,
  contentCount: contentCount as number,
}));

export const genres: AdminGenreResponseDto[] = [
  ["g1", "Action", 7],
  ["g2", "Drama", 5],
  ["g3", "Comedy", 3],
  ["g4", "Thriller", 3],
  ["g5", "Sci-Fi", 2],
  ["g6", "Romance", 1],
  ["g7", "Documentary", 0],
].map(([id, name, contentCount], i) => ({
  id: id as string,
  name: name as string,
  slug: slugify(name as string),
  isActive: true,
  sortOrder: i + 1,
  contentCount: contentCount as number,
}));

export const tags: AdminTagResponseDto[] = [
  ["t1", "Blockbuster", 6],
  ["t2", "Award Winner", 3],
  ["t3", "Behind the Scenes", 3],
  ["t4", "Bollywood", 4],
  ["t5", "Superhero", 4],
  ["t6", "Sequel", 2],
  ["t7", "Festival", 0],
].map(([id, name, contentCount]) => ({
  id: id as string,
  name: name as string,
  slug: slugify(name as string),
  contentCount: contentCount as number,
}));

export const people: PersonResponseDto[] = [
  ["pp1", "Robert Downey Jr.", "actor", 3],
  ["pp2", "Deepika Padukone", "actor", 3],
  ["pp3", "Christopher Nolan", "director", 2],
  ["pp4", "Shah Rukh Khan", "actor", 2],
  ["pp5", "Denis Villeneuve", "director", 2],
  ["pp6", "Zendaya", "actor", 1],
  ["pp7", "Kiran Rao", "director", 1],
  ["pp8", "Greta Gerwig", "writer", 0],
].map(([id, name, knownFor, contentCount]) => ({
  id: id as string,
  name: name as string,
  slug: slugify(name as string),
  photoMediaId: null,
  photoUrl: null,
  bio: null,
  knownFor: knownFor as PersonResponseDto["knownFor"],
  contentCount: contentCount as number,
}));

const filterSort = <T extends Named>(rows: T[], q?: string, sort?: Sort) => {
  const needle = q?.toLowerCase().trim();
  const filtered = rows.filter((r) => !needle || r.name.toLowerCase().includes(needle));
  return [...filtered].sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name)
      : sort === "least_used"
        ? a.contentCount - b.contentCount
        : b.contentCount - a.contentCount,
  );
};

const summaryOf = (rows: Named[]): TaxonomySummaryDto => {
  const top = [...rows].sort((a, b) => b.contentCount - a.contentCount)[0];
  return {
    total: rows.length,
    unusedCount: rows.filter((r) => !r.contentCount).length,
    mostUsed: top && top.contentCount ? { id: top.id, name: top.name, contentCount: top.contentCount } : null,
  };
};

const assertFree = (rows: Named[], name: string, what: string, exceptId?: string) => {
  if (rows.some((r) => r.id !== exceptId && r.name.toLowerCase() === name.trim().toLowerCase())) {
    throw conflict(`A ${what} named "${name.trim()}" already exists`);
  }
};

const find = <T extends Named>(rows: T[], id: string, what: string) => {
  const found = rows.find((r) => r.id === id);
  if (!found) throw notFound(what);
  return found;
};

const remove = <T extends Named>(rows: T[], id: string, what: string) => {
  rows.splice(rows.indexOf(find(rows, id, what)), 1);
  return ok({ message: `${what} deleted` });
};

/** Assigns the defined fields of a patch (`null` clears). */
const patch = <T extends object>(target: T, dto: object) =>
  Object.assign(target, Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined)));

export const adminContentLibraryApi = {
  // Studios ────────────────────────────────────────────────────────────────
  async adminTaxonomyControllerStudiosV1(params: { q?: string; sort?: Sort } = {}) {
    return ok({ items: filterSort(studios, params?.q, params?.sort), summary: summaryOf(studios) });
  },
  async adminTaxonomyControllerCreateStudioV1({ createStudioDto: dto }: { createStudioDto: CreateStudioDto }) {
    assertFree(studios, dto.name, "studio");
    const created: StudioResponseDto = {
      id: newId("st"),
      name: dto.name.trim(),
      slug: slugify(dto.name),
      logoMediaId: dto.logoMediaId ?? null,
      logoUrl: mediaUrl(dto.logoMediaId),
      description: dto.description ?? null,
      countryCode: dto.countryCode ?? null,
      contentCount: 0,
    };
    studios.push(created);
    return ok(created);
  },
  async adminTaxonomyControllerUpdateStudioV1({ id, updateStudioDto: dto }: { id: string; updateStudioDto: UpdateStudioDto }) {
    const studio = find(studios, id, "Studio");
    if (dto.name) assertFree(studios, dto.name, "studio", id);
    patch(studio, dto);
    studio.logoUrl = mediaUrl(studio.logoMediaId);
    return ok(studio);
  },
  async adminTaxonomyControllerDeleteStudioV1({ id }: { id: string }) {
    return remove(studios, id, "Studio");
  },

  // Genres ─────────────────────────────────────────────────────────────────
  async adminTaxonomyControllerGenresV1(params: { q?: string; sort?: Sort } = {}) {
    return ok({ items: filterSort(genres, params?.q, params?.sort), summary: summaryOf(genres) });
  },
  async adminTaxonomyControllerCreateGenreV1({ createGenreDto: dto }: { createGenreDto: CreateGenreDto }) {
    assertFree(genres, dto.name, "genre");
    const created: AdminGenreResponseDto = {
      id: newId("g"),
      name: dto.name.trim(),
      slug: slugify(dto.name),
      isActive: true,
      sortOrder: dto.sortOrder ?? genres.length + 1,
      contentCount: 0,
    };
    genres.push(created);
    return ok(created);
  },
  async adminTaxonomyControllerUpdateGenreV1({ id, updateGenreDto: dto }: { id: string; updateGenreDto: UpdateGenreDto }) {
    const genre = find(genres, id, "Genre");
    if (dto.name) assertFree(genres, dto.name, "genre", id);
    return ok(patch(genre, dto));
  },
  async adminTaxonomyControllerDeleteGenreV1({ id }: { id: string }) {
    return remove(genres, id, "Genre");
  },

  // Tags ───────────────────────────────────────────────────────────────────
  async adminTaxonomyControllerTagsV1(params: { q?: string; sort?: Sort; page?: number; limit?: number } = {}) {
    const { items, pagination } = paginate(filterSort(tags, params?.q, params?.sort), params?.page, params?.limit);
    return ok({ items, pagination, summary: summaryOf(tags) });
  },
  async adminTaxonomyControllerCreateTagV1({ createTagDto: dto }: { createTagDto: CreateTagDto }) {
    assertFree(tags, dto.name, "tag");
    const created: AdminTagResponseDto = { id: newId("t"), name: dto.name.trim(), slug: slugify(dto.name), contentCount: 0 };
    tags.push(created);
    return ok(created);
  },
  async adminTaxonomyControllerUpdateTagV1({ id, createTagDto: dto }: { id: string; createTagDto: CreateTagDto }) {
    const tag = find(tags, id, "Tag");
    assertFree(tags, dto.name, "tag", id);
    return ok(patch(tag, { name: dto.name.trim(), slug: slugify(dto.name) }));
  },
  async adminTaxonomyControllerDeleteTagV1({ id }: { id: string }) {
    return remove(tags, id, "Tag");
  },

  // People ─────────────────────────────────────────────────────────────────
  async adminTaxonomyControllerPeopleV1(params: { q?: string; sort?: Sort; page?: number; limit?: number; knownFor?: string } = {}) {
    const rows = filterSort(people, params?.q, params?.sort).filter(
      (p) => !params?.knownFor || p.knownFor === params.knownFor,
    );
    const { items, pagination } = paginate(rows, params?.page, params?.limit);
    return ok({ items, pagination, summary: summaryOf(people) });
  },
  async adminTaxonomyControllerCreatePersonV1({ createPersonDto: dto }: { createPersonDto: CreatePersonDto }) {
    assertFree(people, dto.name, "person");
    const created: PersonResponseDto = {
      id: newId("pp"),
      name: dto.name.trim(),
      slug: slugify(dto.name),
      photoMediaId: dto.photoMediaId ?? null,
      photoUrl: mediaUrl(dto.photoMediaId),
      bio: dto.bio ?? null,
      knownFor: (dto.knownFor ?? null) as PersonResponseDto["knownFor"],
      contentCount: 0,
    };
    people.push(created);
    return ok(created);
  },
  async adminTaxonomyControllerUpdatePersonV1({ id, updatePersonDto: dto }: { id: string; updatePersonDto: UpdatePersonDto }) {
    const person = find(people, id, "Person");
    if (dto.name) assertFree(people, dto.name, "person", id);
    patch(person, dto);
    person.photoUrl = mediaUrl(person.photoMediaId);
    return ok(person);
  },
  async adminTaxonomyControllerDeletePersonV1({ id }: { id: string }) {
    return remove(people, id, "Person");
  },
};
